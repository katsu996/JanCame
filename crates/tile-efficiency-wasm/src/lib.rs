use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const TILE_COUNT: usize = 34;

static ALL_TILES: [&str; TILE_COUNT] = [
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "1p", "2p", "3p", "4p", "5p", "6p",
    "7p", "8p", "9p", "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "E", "S", "W", "N",
    "P", "F", "C",
];

#[derive(Serialize, Deserialize, Clone)]
struct DiscardCandidate {
    tile: String,
    shantenAfter: i32,
    ukeireTiles: Vec<String>,
    ukeireCount: i32,
}

#[derive(Serialize, Deserialize)]
struct EfficiencyResult {
    shanten: i32,
    candidates: Vec<DiscardCandidate>,
}

fn tile_to_index(tile: &str) -> Option<usize> {
    ALL_TILES.iter().position(|value| *value == tile)
}

fn index_to_tile(index: usize) -> String {
    ALL_TILES[index].to_string()
}

fn counts_from_tiles(tiles: &[String]) -> Result<[u8; TILE_COUNT], String> {
    let mut counts = [0u8; TILE_COUNT];
    for tile in tiles {
        let index = tile_to_index(tile).ok_or_else(|| format!("Unknown tile: {tile}"))?;
        counts[index] += 1;
        if counts[index] > 4 {
            return Err(format!("Too many copies of {}", ALL_TILES[index]));
        }
    }
    Ok(counts)
}

fn can_form_sequence(index: usize) -> bool {
    index < 27 && index % 9 <= 6
}

fn chiitoitsu_shanten(counts: &[u8; TILE_COUNT]) -> i32 {
    let mut pairs = 0;
    let mut kinds = 0;
    for count in counts {
        if *count >= 1 {
            kinds += 1;
        }
        if *count >= 2 {
            pairs += 1;
        }
    }
    6 - pairs + i32::max(0, kinds - 7)
}

fn normal_shanten(counts: &[u8; TILE_COUNT]) -> i32 {
    let mut tiles = *counts;
    let mut min_shanten = 8;

    fn evaluate(min_shanten: &mut i32, melds: i32, pair: bool, taatsu: i32) {
        let mut shanten = 8 - melds * 2 - i32::from(pair) - taatsu;
        let groups = melds + taatsu;
        if groups > 4 {
            shanten += groups - 4;
        }
        *min_shanten = (*min_shanten).min(shanten);
    }

    fn search(
        tiles: &mut [u8; TILE_COUNT],
        min_shanten: &mut i32,
        index: usize,
        melds: i32,
        pair: bool,
        taatsu: i32,
    ) {
        let mut cursor = index;
        while cursor < TILE_COUNT && tiles[cursor] == 0 {
            cursor += 1;
        }

        if cursor == TILE_COUNT {
            evaluate(min_shanten, melds, pair, taatsu);
            return;
        }

        if melds + taatsu >= 4 {
            evaluate(min_shanten, melds, pair, taatsu);
        }

        if !pair && tiles[cursor] >= 2 {
            tiles[cursor] -= 2;
            search(tiles, min_shanten, cursor, melds, true, taatsu);
            tiles[cursor] += 2;
        }

        if tiles[cursor] >= 3 {
            tiles[cursor] -= 3;
            search(tiles, min_shanten, cursor, melds + 1, pair, taatsu);
            tiles[cursor] += 3;
        }

        if can_form_sequence(cursor) && tiles[cursor + 1] > 0 && tiles[cursor + 2] > 0 {
            tiles[cursor] -= 1;
            tiles[cursor + 1] -= 1;
            tiles[cursor + 2] -= 1;
            search(tiles, min_shanten, cursor, melds + 1, pair, taatsu);
            tiles[cursor] += 1;
            tiles[cursor + 1] += 1;
            tiles[cursor + 2] += 1;
        }

        if melds + taatsu < 4 {
            if can_form_sequence(cursor) && tiles[cursor + 1] > 0 {
                tiles[cursor] -= 1;
                tiles[cursor + 1] -= 1;
                search(tiles, min_shanten, cursor, melds, pair, taatsu + 1);
                tiles[cursor] += 1;
                tiles[cursor + 1] += 1;
            }

            if can_form_sequence(cursor) && tiles[cursor + 2] > 0 {
                tiles[cursor] -= 1;
                tiles[cursor + 2] -= 1;
                search(tiles, min_shanten, cursor, melds, pair, taatsu + 1);
                tiles[cursor] += 1;
                tiles[cursor + 2] += 1;
            }

            if pair && tiles[cursor] >= 2 {
                tiles[cursor] -= 2;
                search(tiles, min_shanten, cursor, melds, pair, taatsu + 1);
                tiles[cursor] += 2;
            }

            if cursor < 27 && cursor % 9 == 0 && tiles[cursor + 1] > 0 {
                tiles[cursor + 1] -= 1;
                search(tiles, min_shanten, cursor + 2, melds, pair, taatsu + 1);
                tiles[cursor + 1] += 1;
            }

            if cursor < 27 && cursor % 9 == 7 && tiles[cursor + 1] > 0 {
                tiles[cursor + 1] -= 1;
                search(tiles, min_shanten, cursor, melds, pair, taatsu + 1);
                tiles[cursor + 1] += 1;
            }
        }

        search(tiles, min_shanten, cursor + 1, melds, pair, taatsu);
    }

    search(&mut tiles, &mut min_shanten, 0, 0, false, 0);
    min_shanten
}

fn calc_shanten(counts: &[u8; TILE_COUNT]) -> i32 {
    normal_shanten(counts).min(chiitoitsu_shanten(counts))
}

fn remaining_count(counts: &[u8; TILE_COUNT], index: usize) -> i32 {
    i32::max(0, 4 - i32::from(counts[index]))
}

fn calc_ukeire_for_13(counts: &mut [u8; TILE_COUNT]) -> (Vec<String>, i32) {
    let base_shanten = calc_shanten(counts);
    let mut ukeire_tiles = Vec::new();
    let mut ukeire_count = 0;

    for index in 0..TILE_COUNT {
        if counts[index] >= 4 {
            continue;
        }
        counts[index] += 1;
        let next_shanten = calc_shanten(counts);
        counts[index] -= 1;

        if next_shanten < base_shanten {
            ukeire_tiles.push(index_to_tile(index));
            ukeire_count += remaining_count(counts, index);
        }
    }

    (ukeire_tiles, ukeire_count)
}

fn calc_discard_candidates(tiles: &[String]) -> Result<Vec<DiscardCandidate>, String> {
    let mut counts = counts_from_tiles(tiles)?;
    let mut candidates = Vec::new();
    let mut seen = [false; TILE_COUNT];

    for index in 0..TILE_COUNT {
        if counts[index] == 0 || seen[index] {
            continue;
        }
        seen[index] = true;

        counts[index] -= 1;
        let shanten_after = calc_shanten(&counts);
        let (ukeire_tiles, ukeire_count) = calc_ukeire_for_13(&mut counts);
        counts[index] += 1;

        candidates.push(DiscardCandidate {
            tile: index_to_tile(index),
            shantenAfter: shanten_after,
            ukeireTiles: ukeire_tiles,
            ukeireCount: ukeire_count,
        });
    }

    candidates.sort_by(|left, right| {
        right
            .ukeireCount
            .cmp(&left.ukeireCount)
            .then_with(|| left.shantenAfter.cmp(&right.shantenAfter))
    });

    Ok(candidates)
}

fn calc_efficiency_for_tiles(tiles: &[String]) -> Result<EfficiencyResult, String> {
    if tiles.is_empty() || tiles.len() > 14 {
        return Err("Hand must contain 1 to 14 tiles".into());
    }

    let counts = counts_from_tiles(tiles)?;

    if tiles.len() == 14 {
        let candidates = calc_discard_candidates(tiles)?;
        let shanten = if candidates.is_empty() {
            calc_shanten(&counts)
        } else {
            candidates
                .iter()
                .map(|candidate| candidate.shantenAfter)
                .min()
                .unwrap_or(calc_shanten(&counts))
        };
        return Ok(EfficiencyResult { shanten, candidates });
    }

    Ok(EfficiencyResult {
        shanten: calc_shanten(&counts),
        candidates: Vec::new(),
    })
}

#[wasm_bindgen]
pub fn calc_efficiency(tiles: JsValue) -> Result<JsValue, JsValue> {
    let tiles: Vec<String> = serde_wasm_bindgen::from_value(tiles)
        .map_err(|error| JsValue::from_str(&format!("Invalid tiles input: {error}")))?;
    let result = calc_efficiency_for_tiles(&tiles).map_err(|error| JsValue::from_str(&error))?;
    serde_wasm_bindgen::to_value(&result)
        .map_err(|error| JsValue::from_str(&format!("Failed to serialize result: {error}")))
}

#[wasm_bindgen]
pub fn calc_shanten_wasm(tiles: JsValue) -> Result<i32, JsValue> {
    let tiles: Vec<String> = serde_wasm_bindgen::from_value(tiles)
        .map_err(|error| JsValue::from_str(&format!("Invalid tiles input: {error}")))?;
    let counts = counts_from_tiles(&tiles).map_err(|error| JsValue::from_str(&error))?;
    Ok(calc_shanten(&counts))
}
