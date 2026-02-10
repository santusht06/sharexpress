# Copyright 2026 Santusht Kotai
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
import random


def get_random_names():
    animals = [
        "falcon",
        "panther",
        "wolf",
        "lynx",
        "eagle",
        "fox",
        "tiger",
        "raven",
        "otter",
        "leopard",
        "hawk",
        "bear",
        "stag",
        "cobra",
        "owl",
        "jaguar",
        "bison",
        "viper",
        "kraken",
        "orca",
    ]

    return f"guest_{random.choice(animals)}_{random.randint(10, 99)}"
