// Döljer konsolfönstret i Windows release-build
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    echo_companion_lib::run();
}
