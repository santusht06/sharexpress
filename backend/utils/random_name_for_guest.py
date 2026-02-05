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
