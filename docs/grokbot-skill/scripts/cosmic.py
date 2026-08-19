#!/usr/bin/env python3
"""
Cosmic Blueprint calculation engine — standalone port.

A dependency-free (stdlib only) port of the deterministic engines in
lib/numerology.ts, lib/chinese-zodiac.ts, lib/western-astrology.ts and
lib/life-stages.ts, plus the daily-reading numbers the web app does not
compute (personal month, personal day, universal day, moon phase, day pillar).

Every number an agent quotes to a user should come from here rather than
from mental arithmetic. Master numbers (11/22/33) survive reduction, the
Chinese zodiac respects Lunar New Year, and the moon is real Meeus, so
hand-computed answers drift from the app's.

Usage:
    python3 cosmic.py profile --name "Ada Lovelace" --dob 1815-12-10 \
        --time 13:45 --lat 51.5074 --lon -0.1278 --tz 0
    python3 cosmic.py daily --dob 1815-12-10 --name "Ada Lovelace" --date 2026-08-19
    python3 cosmic.py numbers --name "Ada Lovelace" --dob 1815-12-10

Output is JSON on stdout.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import unicodedata
from datetime import date, datetime, timezone

# ---------------------------------------------------------------------------
# Numerology
# ---------------------------------------------------------------------------

PYTHAGOREAN_VALUES = {
    "A": 1, "J": 1, "S": 1,
    "B": 2, "K": 2, "T": 2,
    "C": 3, "L": 3, "U": 3,
    "D": 4, "M": 4, "V": 4,
    "E": 5, "N": 5, "W": 5,
    "F": 6, "O": 6, "X": 6,
    "G": 7, "P": 7, "Y": 7,
    "H": 8, "Q": 8, "Z": 8,
    "I": 9, "R": 9,
}

# Y is always a consonant here. Some Pythagorean schools count it as a vowel
# when it functions as one ("Yvonne"); those calculators will disagree.
VOWELS = set("AEIOU")

# Letters that do not decompose to a base Latin letter under NFD.
LETTER_SUBSTITUTIONS = {
    "ø": "o", "Ø": "O",   # ø Ø
    "æ": "ae", "Æ": "AE",  # æ Æ
    "œ": "oe", "Œ": "OE",  # œ Œ
    "ł": "l", "Ł": "L",   # ł Ł
    "đ": "d", "Đ": "D",   # đ Đ
}

MASTER_NUMBERS = (11, 22, 33)


def normalize_name(name: str) -> str:
    """Strip diacritics so "José" and "Jose" score identically."""
    substituted = "".join(LETTER_SUBSTITUTIONS.get(ch, ch) for ch in name)
    decomposed = unicodedata.normalize("NFD", substituted)
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def reduce_number(num: int) -> int:
    """Reduce to a single digit, preserving master numbers 11, 22 and 33."""
    while num > 9 and num not in MASTER_NUMBERS:
        num = sum(int(d) for d in str(num))
    return num


def sum_letters(letters: str) -> int:
    return sum(PYTHAGOREAN_VALUES.get(ch, 0) for ch in normalize_name(letters).upper())


def life_path(dob: date) -> int:
    """Month, day and year each reduce on their own, then the three sum."""
    reduced_month = reduce_number(dob.month)
    reduced_day = reduce_number(dob.day)
    reduced_year = reduce_number(sum(int(d) for d in str(dob.year)))
    return reduce_number(reduced_month + reduced_day + reduced_year)


def expression(full_name: str) -> int:
    return reduce_number(sum_letters(full_name))


def soul_urge(full_name: str) -> int:
    vowels = [ch for ch in normalize_name(full_name).upper() if ch in VOWELS]
    return reduce_number(sum_letters("".join(vowels)))


def personality(full_name: str) -> int:
    consonants = [
        ch for ch in normalize_name(full_name).upper()
        if ch in PYTHAGOREAN_VALUES and ch not in VOWELS
    ]
    return reduce_number(sum_letters("".join(consonants)))


def personal_year(dob: date, year: int) -> int:
    reduced_month = reduce_number(dob.month)
    reduced_day = reduce_number(dob.day)
    reduced_year = reduce_number(sum(int(d) for d in str(year)))
    return reduce_number(reduced_month + reduced_day + reduced_year)


def personal_month(dob: date, on: date) -> int:
    """Personal year of the calendar year `on` falls in, plus that month."""
    return reduce_number(personal_year(dob, on.year) + reduce_number(on.month))


def personal_day(dob: date, on: date) -> int:
    return reduce_number(personal_month(dob, on) + reduce_number(on.day))


def universal_day(on: date) -> int:
    """The day's own number, shared by everyone alive that day."""
    return reduce_number(
        reduce_number(on.month)
        + reduce_number(on.day)
        + reduce_number(sum(int(d) for d in str(on.year)))
    )


# ---------------------------------------------------------------------------
# Chinese zodiac
# ---------------------------------------------------------------------------

LUNAR_NEW_YEAR = {
    1924: (2, 5), 1925: (1, 24), 1926: (2, 13), 1927: (2, 2), 1928: (1, 23),
    1929: (2, 10), 1930: (1, 30), 1931: (2, 17), 1932: (2, 6), 1933: (1, 26),
    1934: (2, 14), 1935: (2, 4), 1936: (1, 24), 1937: (2, 11), 1938: (1, 31),
    1939: (2, 19), 1940: (2, 8), 1941: (1, 27), 1942: (2, 15), 1943: (2, 5),
    1944: (1, 25), 1945: (2, 13), 1946: (2, 2), 1947: (1, 22), 1948: (2, 10),
    1949: (1, 29), 1950: (2, 17), 1951: (2, 6), 1952: (1, 27), 1953: (2, 14),
    1954: (2, 3), 1955: (1, 24), 1956: (2, 12), 1957: (1, 31), 1958: (2, 18),
    1959: (2, 8), 1960: (1, 28), 1961: (2, 15), 1962: (2, 5), 1963: (1, 25),
    1964: (2, 13), 1965: (2, 2), 1966: (1, 21), 1967: (2, 9), 1968: (1, 30),
    1969: (2, 17), 1970: (2, 6), 1971: (1, 27), 1972: (2, 15), 1973: (2, 3),
    1974: (1, 23), 1975: (2, 11), 1976: (1, 31), 1977: (2, 18), 1978: (2, 7),
    1979: (1, 28), 1980: (2, 16), 1981: (2, 5), 1982: (1, 25), 1983: (2, 13),
    1984: (2, 2), 1985: (2, 20), 1986: (2, 9), 1987: (1, 29), 1988: (2, 17),
    1989: (2, 6), 1990: (1, 27), 1991: (2, 15), 1992: (2, 4), 1993: (1, 23),
    1994: (2, 10), 1995: (1, 31), 1996: (2, 19), 1997: (2, 7), 1998: (1, 28),
    1999: (2, 16), 2000: (2, 5), 2001: (1, 24), 2002: (2, 12), 2003: (2, 1),
    2004: (1, 22), 2005: (2, 9), 2006: (1, 29), 2007: (2, 18), 2008: (2, 7),
    2009: (1, 26), 2010: (2, 14), 2011: (2, 3), 2012: (1, 23), 2013: (2, 10),
    2014: (1, 31), 2015: (2, 19), 2016: (2, 8), 2017: (1, 28), 2018: (2, 16),
    2019: (2, 5), 2020: (1, 25), 2021: (2, 12), 2022: (2, 1), 2023: (1, 22),
    2024: (2, 10), 2025: (1, 29), 2026: (2, 17), 2027: (2, 6), 2028: (1, 26),
    2029: (2, 13), 2030: (2, 3), 2031: (1, 23), 2032: (2, 11), 2033: (1, 31),
    2034: (2, 19), 2035: (2, 8), 2036: (1, 28), 2037: (2, 15), 2038: (2, 4),
    2039: (1, 24), 2040: (2, 12), 2041: (2, 1), 2042: (1, 22), 2043: (2, 10),
    2044: (1, 30),
}

ANIMALS = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
]

ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]

ANIMAL_EMOJIS = {
    "Rat": "🐀", "Ox": "🐂", "Tiger": "🐅", "Rabbit": "🐇",
    "Dragon": "🐉", "Snake": "🐍", "Horse": "🐎", "Goat": "🐐",
    "Monkey": "🐒", "Rooster": "🐓", "Dog": "🐕", "Pig": "🐖",
}

SAN_HE_TRINES = [
    ["Rat", "Dragon", "Monkey"],
    ["Ox", "Snake", "Rooster"],
    ["Tiger", "Horse", "Dog"],
    ["Rabbit", "Goat", "Pig"],
]

LIU_HE_PAIRS = [
    ("Rat", "Ox"), ("Tiger", "Pig"), ("Rabbit", "Dog"),
    ("Dragon", "Rooster"), ("Snake", "Monkey"), ("Horse", "Goat"),
]

LIU_CHONG_PAIRS = [
    ("Rat", "Horse"), ("Ox", "Goat"), ("Tiger", "Monkey"),
    ("Rabbit", "Rooster"), ("Dragon", "Dog"), ("Snake", "Pig"),
]

LIU_HAI_PAIRS = [
    ("Rat", "Goat"), ("Ox", "Horse"), ("Tiger", "Snake"),
    ("Rabbit", "Dragon"), ("Monkey", "Pig"), ("Rooster", "Dog"),
]


def _build_compatibility():
    table = {animal: {"best": [], "challenging": []} for animal in ANIMALS}
    for trine in SAN_HE_TRINES:
        for a in trine:
            for b in trine:
                if a != b:
                    table[a]["best"].append(b)
    for a, b in LIU_HE_PAIRS:
        table[a]["best"].append(b)
        table[b]["best"].append(a)
    for a, b in LIU_CHONG_PAIRS + LIU_HAI_PAIRS:
        table[a]["challenging"].append(b)
        table[b]["challenging"].append(a)
    return table


COMPATIBILITY = _build_compatibility()


def chinese_zodiac_year(dob: date) -> int:
    """A January or early-February birth belongs to the previous animal year."""
    lny = LUNAR_NEW_YEAR.get(dob.year)
    if lny is None:
        # Outside the table (before 1924 / after 2044). Lunar New Year always
        # falls Jan 21 - Feb 20, so Feb 5 is the least-wrong single cutoff.
        if dob.month == 1 or (dob.month == 2 and dob.day < 5):
            return dob.year - 1
        return dob.year
    month, day = lny
    if dob.month < month or (dob.month == month and dob.day < day):
        return dob.year - 1
    return dob.year


def chinese_zodiac(dob: date) -> dict:
    zodiac_year = chinese_zodiac_year(dob)
    animal = ANIMALS[(zodiac_year - 1924) % 12]
    element = ELEMENTS[((zodiac_year - 4) % 10) // 2]
    yin_yang = "Yang" if zodiac_year % 2 == 0 else "Yin"
    compat = COMPATIBILITY[animal]
    return {
        "animal": animal,
        "emoji": ANIMAL_EMOJIS[animal],
        "element": element,
        "yinYang": yin_yang,
        "zodiacYear": zodiac_year,
        "compatibility": {
            "bestWith": compat["best"],
            "challenging": compat["challenging"],
        },
    }


# The sexagenary day cycle, anchored on 2000-01-07 = 甲子 (jiazi, index 0).
STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"]
STEM_ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"]


def day_pillar(on: date) -> dict:
    """Today's animal and element in the 60-day cycle — a daily-reading accent."""
    jdn = int(julian_day(datetime(on.year, on.month, on.day, 12, tzinfo=timezone.utc)))
    index = (jdn + 49) % 60
    stem = index % 10
    return {
        "animal": ANIMALS[index % 12],
        "emoji": ANIMAL_EMOJIS[ANIMALS[index % 12]],
        "stem": STEMS[stem],
        "element": STEM_ELEMENTS[stem],
        "polarity": "Yang" if index % 2 == 0 else "Yin",
    }


# ---------------------------------------------------------------------------
# Western astrology
# ---------------------------------------------------------------------------

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

SIGN_META = {
    "Aries": ("♈", "Fire", "Cardinal", "Mars"),
    "Taurus": ("♉", "Earth", "Fixed", "Venus"),
    "Gemini": ("♊", "Air", "Mutable", "Mercury"),
    "Cancer": ("♋", "Water", "Cardinal", "Moon"),
    "Leo": ("♌", "Fire", "Fixed", "Sun"),
    "Virgo": ("♍", "Earth", "Mutable", "Mercury"),
    "Libra": ("♎", "Air", "Cardinal", "Venus"),
    "Scorpio": ("♏", "Water", "Fixed", "Pluto"),
    "Sagittarius": ("♐", "Fire", "Mutable", "Jupiter"),
    "Capricorn": ("♑", "Earth", "Cardinal", "Saturn"),
    "Aquarius": ("♒", "Air", "Fixed", "Uranus"),
    "Pisces": ("♓", "Water", "Mutable", "Neptune"),
}


def normalize360(deg: float) -> float:
    return deg % 360.0


def julian_day(dt: datetime) -> float:
    """Julian Day Number from a UTC datetime."""
    y, m = dt.year, dt.month
    d = dt.day + dt.hour / 24 + dt.minute / 1440 + dt.second / 86400
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d + b - 1524.5


def birth_instant_utc(dob: date, birth_time: str | None, tz_offset: float | None) -> datetime:
    """Noon local stands in for an unknown birth time, so cusp days land on
    the sign that held for most of the day."""
    hours, minutes = 12, 0
    if birth_time:
        parts = birth_time.split(":")
        try:
            hours, minutes = int(parts[0]), int(parts[1])
        except (ValueError, IndexError):
            hours, minutes = 12, 0
    offset = tz_offset or 0.0
    naive = datetime(dob.year, dob.month, dob.day, tzinfo=timezone.utc)
    return naive.replace(hour=0, minute=0) + _hours(hours - offset) + _hours(minutes / 60)


def _hours(value: float):
    from datetime import timedelta
    return timedelta(hours=value)


def sun_longitude(jd: float) -> float:
    """Low-precision solar longitude, ~0.01° — plenty for sign and decan."""
    n = jd - 2451545.0
    mean_longitude = normalize360(280.460 + 0.9856474 * n)
    mean_anomaly = math.radians(normalize360(357.528 + 0.9856003 * n))
    return normalize360(
        mean_longitude
        + 1.915 * math.sin(mean_anomaly)
        + 0.020 * math.sin(2 * mean_anomaly)
    )


# Meeus, "Astronomical Algorithms" 2nd ed., Table 47.A (leading 59 terms).
# Each entry: (D, M, M', F, sine coefficient).
_MOON_LON_TERMS = [
    (0, 0, 1, 0, 6288774), (2, 0, -1, 0, 1274027), (2, 0, 0, 0, 658314),
    (0, 0, 2, 0, 213618), (0, 1, 0, 0, -185116), (0, 0, 0, 2, -114332),
    (2, 0, -2, 0, 58793), (2, -1, -1, 0, 57066), (2, 0, 1, 0, 53322),
    (2, -1, 0, 0, 45758), (0, 1, -1, 0, -40923), (1, 0, 0, 0, -34720),
    (0, 1, 1, 0, -30383), (2, 0, 0, -2, 15327), (0, 0, 1, 2, -12528),
    (0, 0, 1, -2, 10980), (4, 0, -1, 0, 10675), (0, 0, 3, 0, 10034),
    (4, 0, -2, 0, 8548), (2, 1, -1, 0, -7888), (2, 1, 0, 0, -6766),
    (1, 0, -1, 0, -5163), (1, 1, 0, 0, 4987), (2, -1, 1, 0, 4036),
    (2, 0, 2, 0, 3994), (4, 0, 0, 0, 3861), (2, 0, -3, 0, 3665),
    (0, 1, -2, 0, -2689), (2, 0, -1, 2, -2602), (2, -1, -2, 0, 2390),
    (1, 0, 1, 0, -2348), (2, -2, 0, 0, 2236), (0, 1, 2, 0, -2120),
    (0, 2, 0, 0, -2069), (2, -2, -1, 0, 2048), (2, 0, 1, -2, -1773),
    (2, 0, 0, 2, -1595), (4, -1, -1, 0, 1215), (0, 0, 2, 2, -1110),
    (3, 0, -1, 0, -892), (2, 1, 1, 0, -810), (4, -1, -2, 0, 759),
    (0, 2, -1, 0, -713), (2, 2, -1, 0, -700), (2, 1, -2, 0, 691),
    (2, -1, 0, -2, 596), (4, 0, 1, 0, 549), (0, 0, 4, 0, 537),
    (4, -1, 0, 0, 520), (1, 0, -2, 0, -487), (2, 1, 0, -2, -399),
    (0, 0, 2, -2, -381), (1, 1, 1, 0, 351), (3, 0, -2, 0, -340),
    (4, 0, -3, 0, 330), (2, -1, 2, 0, 327), (0, 2, 1, 0, -323),
    (1, 1, -1, 0, 299), (2, 0, 3, 0, 294),
]


def moon_longitude(jd: float) -> float:
    """Lunar ecliptic longitude via Meeus, accurate to ~0.5° — enough for sign."""
    t = (jd - 2451545.0) / 36525.0
    t2, t3, t4 = t * t, t ** 3, t ** 4

    mean_longitude = normalize360(
        218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000
    )
    moon_anomaly = normalize360(
        134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000
    )
    sun_anomaly = normalize360(
        357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000
    )
    argument_of_latitude = normalize360(
        93.2720950 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000
    )
    elongation = normalize360(
        297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000
    )
    node = normalize360(
        125.0445479 - 1934.1362891 * t + 0.0020754 * t2 + t3 / 467441 - t4 / 60616000
    )

    eccentricity = 1 - 0.002516 * t - 0.0000074 * t2

    total = 0.0
    for d_mult, m_mult, mp_mult, f_mult, coeff in _MOON_LON_TERMS:
        arg = math.radians(
            d_mult * elongation
            + m_mult * sun_anomaly
            + mp_mult * moon_anomaly
            + f_mult * argument_of_latitude
        )
        term = coeff * math.sin(arg)
        if abs(m_mult) == 1:
            term *= eccentricity
        elif abs(m_mult) == 2:
            term *= eccentricity ** 2
        total += term

    a1 = normalize360(119.75 + 131.849 * t)
    a2 = normalize360(53.09 + 479264.290 * t)
    total += 3958 * math.sin(math.radians(a1))
    total += 1962 * math.sin(math.radians(mean_longitude - argument_of_latitude))
    total += 318 * math.sin(math.radians(a2))

    nutation = -17.2 * math.sin(math.radians(node)) - 1.32 * math.sin(math.radians(2 * mean_longitude))

    return normalize360(mean_longitude + total / 1_000_000 + nutation / 3600)


def sun_sign(dob: date, birth_time: str | None = None, tz_offset: float | None = None) -> dict:
    jd = julian_day(birth_instant_utc(dob, birth_time, tz_offset))
    longitude = sun_longitude(jd)
    sign = SIGNS[int(longitude // 30) % 12]
    glyph, element, modality, ruler = SIGN_META[sign]
    return {
        "sign": sign,
        "glyph": glyph,
        "decan": int((longitude % 30) // 10) + 1,
        "element": element,
        "modality": modality,
        "rulingPlanet": ruler,
        "longitude": round(longitude, 3),
    }


def moon_sign(dob: date, birth_time: str | None = None, tz_offset: float | None = None):
    """With a birth time, the moon's sign at that moment. Without one, the sign
    only if it holds from 00:00 to 23:59 local — otherwise None (ask for a time)."""
    offset = tz_offset or 0.0

    def sign_at(hours: int, minutes: int) -> str:
        instant = (
            datetime(dob.year, dob.month, dob.day, tzinfo=timezone.utc)
            + _hours(hours - offset)
            + _hours(minutes / 60)
        )
        return SIGNS[int(moon_longitude(julian_day(instant)) // 30) % 12]

    if birth_time:
        try:
            hours, minutes = (int(p) for p in birth_time.split(":")[:2])
            return sign_at(hours, minutes)
        except ValueError:
            pass

    start, end = sign_at(0, 0), sign_at(23, 59)
    return start if start == end else None


def rising_sign(
    dob: date, birth_time: str, latitude: float, longitude: float, tz_offset: float | None = None
):
    """Ascendant: atan2(cos RAMC, -(sin RAMC · cos ε + tan φ · sin ε))."""
    if not birth_time:
        return None
    try:
        hours, minutes = (int(p) for p in birth_time.split(":")[:2])
    except ValueError:
        return None

    # Inside the polar circles some signs never rise; clamp for a usable estimate.
    phi = math.radians(max(-66.0, min(66.0, latitude)))
    offset = tz_offset or 0.0
    instant = (
        datetime(dob.year, dob.month, dob.day, tzinfo=timezone.utc)
        + _hours(hours - offset)
        + _hours(minutes / 60)
    )
    jd = julian_day(instant)
    gmst = normalize360(280.46061837 + 360.98564736629 * (jd - 2451545.0))
    ramc = math.radians(normalize360(gmst + longitude))
    eps = math.radians(23.4393)

    asc = normalize360(
        math.degrees(
            math.atan2(
                math.cos(ramc),
                -(math.sin(ramc) * math.cos(eps) + math.tan(phi) * math.sin(eps)),
            )
        )
    )
    return SIGNS[int(asc // 30) % 12]


MOON_PHASES = [
    (0, "New Moon", "seed an intention, start quietly"),
    (45, "Waxing Crescent", "commit and gather momentum"),
    (90, "First Quarter", "push through the first real resistance"),
    (135, "Waxing Gibbous", "refine, adjust, keep going"),
    (180, "Full Moon", "culmination, clarity, and heightened feeling"),
    (225, "Waning Gibbous", "share what you learned"),
    (270, "Last Quarter", "release what is not working"),
    (315, "Waning Crescent", "rest and clear the decks"),
]


def moon_phase(on: date) -> dict:
    """Elongation of moon from sun at 12:00 UTC, bucketed into eight phases."""
    jd = julian_day(datetime(on.year, on.month, on.day, 12, tzinfo=timezone.utc))
    angle = normalize360(moon_longitude(jd) - sun_longitude(jd))
    index = int(((angle + 22.5) % 360) // 45)
    name, guidance = MOON_PHASES[index][1], MOON_PHASES[index][2]
    return {
        "phase": name,
        "guidance": guidance,
        "illumination": round((1 - math.cos(math.radians(angle))) / 2 * 100),
        "angle": round(angle, 1),
    }


# ---------------------------------------------------------------------------
# Life stage
# ---------------------------------------------------------------------------

LIFE_STAGES = {
    "exploring": {
        "stage": "Exploring Life",
        "focusAreas": ["identity discovery", "potential", "personal growth", "finding direction"],
        "toneGuidance": (
            "Encouraging and possibility-oriented. Emphasize potential and discovery. Frame "
            "challenges as growth opportunities. Avoid prescriptive advice — invite exploration instead."
        ),
        "topicsToEmphasize": [
            "natural talents and strengths", "areas of untapped potential",
            "learning styles and intellectual gifts", "social and communication strengths",
            "what makes them unique",
        ],
        "topicsToDeemphasize": [
            "career milestones", "financial planning", "relationship advice", "legacy themes",
        ],
    },
    "building_career": {
        "stage": "Building Career",
        "focusAreas": ["professional strengths", "leadership style", "strategic timing", "work-life harmony"],
        "toneGuidance": (
            "Strategic and empowering. Focus on professional strengths and timing. Frame cosmic "
            "patterns as tools for career navigation. Be specific about leadership and communication styles."
        ),
        "topicsToEmphasize": [
            "natural leadership style", "professional strengths and blind spots",
            "best timing for initiatives and risks", "communication and collaboration style",
            "ideal work environment and conditions",
        ],
        "topicsToDeemphasize": ["retirement themes", "parenting style", "spiritual development emphasis"],
    },
    "in_relationship": {
        "stage": "In a Relationship",
        "focusAreas": ["relational dynamics", "emotional needs", "communication style", "growth together"],
        "toneGuidance": (
            "Warm and relationally focused. Emphasize emotional intelligence and communication "
            "patterns. Frame personal traits in terms of how they show up in partnerships. Be sensitive and nuanced."
        ),
        "topicsToEmphasize": [
            "emotional needs and love language tendencies", "communication patterns in intimacy",
            "attachment style tendencies", "what they bring to partnerships",
            "areas of personal growth within relationship",
        ],
        "topicsToDeemphasize": [
            "pure career ambition framing", "independence at all costs", "solitary pursuits emphasis",
        ],
    },
    "married": {
        "stage": "Married",
        "focusAreas": ["partnership dynamics", "shared goals", "emotional depth", "evolving together"],
        "toneGuidance": (
            "Grounded and partnership-oriented. Acknowledge the depth of committed partnership. "
            "Focus on evolving together, maintaining individual identity within union, and deepening connection."
        ),
        "topicsToEmphasize": [
            "partnership strengths and dynamics", "emotional depth and vulnerability patterns",
            "shared purpose and vision alignment", "maintaining individuality within commitment",
            "deepening intimacy over time",
        ],
        "topicsToDeemphasize": [
            "single life exploration", "radical independence framing", "starting from scratch themes",
        ],
    },
    "parent": {
        "stage": "Parent",
        "focusAreas": ["nurturing style", "patience patterns", "family dynamics", "self-care balance"],
        "toneGuidance": (
            "Compassionate and understanding. Acknowledge the intensity of parenting. Balance focus "
            "between their role as parent and their identity as an individual. Emphasize self-compassion."
        ),
        "topicsToEmphasize": [
            "natural nurturing and teaching style", "patience and emotional regulation patterns",
            "balancing personal needs with caretaking", "what kind of environment they create",
            "how their cosmic profile shows up in family dynamics",
        ],
        "topicsToDeemphasize": [
            "aggressive career ambition", "solo adventure emphasis", "risk-taking encouragement",
        ],
    },
    "empty_nester": {
        "stage": "Empty Nester",
        "focusAreas": ["rediscovery", "new chapters", "wisdom sharing", "personal renaissance"],
        "toneGuidance": (
            "Celebratory and forward-looking. Acknowledge the transition with respect. Emphasize the "
            "exciting opportunity for rediscovery and new pursuits. Frame wisdom as a superpower."
        ),
        "topicsToEmphasize": [
            "rediscovering personal passions", "new chapter possibilities",
            "accumulated wisdom and how to use it", "evolving relationship dynamics",
            "creative and spiritual renaissance",
        ],
        "topicsToDeemphasize": [
            "basic identity discovery", "entry-level career advice", "early relationship dynamics",
        ],
    },
    "retired": {
        "stage": "Retired",
        "focusAreas": ["wisdom integration", "legacy", "spiritual depth", "joyful living"],
        "toneGuidance": (
            "Respectful and wisdom-honoring. Acknowledge the depth of lived experience. Focus on "
            "integration, legacy, spiritual growth, and the freedom this chapter brings. Never patronize."
        ),
        "topicsToEmphasize": [
            "wisdom integration and life review", "legacy and what they leave behind",
            "spiritual deepening and inner peace", "mentoring and sharing knowledge",
            "joyful living and freedom of this chapter",
        ],
        "topicsToDeemphasize": [
            "career climbing", "basic relationship advice", "youthful identity exploration",
        ],
    },
    "prefer_not_to_say": {
        "stage": "Universal",
        "focusAreas": ["self-understanding", "personal growth", "timing awareness", "inner wisdom"],
        "toneGuidance": (
            "Balanced and universally applicable. Focus on self-understanding and personal growth "
            "without assumptions about life circumstances. Keep advice broadly relevant."
        ),
        "topicsToEmphasize": [
            "core personality strengths", "personal growth opportunities",
            "communication and emotional patterns", "timing and cycles", "inner wisdom and intuition",
        ],
        "topicsToDeemphasize": [],
    },
}


def age_range(age: int) -> str:
    if age < 18:
        return "youth"
    if age < 25:
        return "young adult"
    if age < 35:
        return "early adulthood"
    if age < 50:
        return "midlife"
    if age < 65:
        return "mature"
    return "elder"


def calculate_age(dob: date, on: date | None = None) -> int:
    on = on or date.today()
    return on.year - dob.year - ((on.month, on.day) < (dob.month, dob.day))


def classify_life_stage(age: int, selected: list[str]) -> dict:
    """Multiple stages merge: emphases union, de-emphases union minus anything
    another selected stage emphasizes, tones blend. "Prefer not to say" is exclusive."""
    if not selected or "prefer_not_to_say" in selected:
        selected = ["prefer_not_to_say"]

    contexts = [LIFE_STAGES.get(s, LIFE_STAGES["prefer_not_to_say"]) for s in selected]

    if len(contexts) == 1:
        return {**contexts[0], "ageRange": age_range(age)}

    def dedupe(values):
        return list(dict.fromkeys(values))

    emphasize = dedupe([t for c in contexts for t in c["topicsToEmphasize"]])
    deemphasize = [
        t for t in dedupe([t for c in contexts for t in c["topicsToDeemphasize"]])
        if t not in emphasize
    ]
    stage_names = [c["stage"] for c in contexts]

    return {
        "stage": " & ".join(stage_names),
        "ageRange": age_range(age),
        "focusAreas": dedupe([f for c in contexts for f in c["focusAreas"]]),
        "toneGuidance": (
            "This person is navigating multiple life dimensions at once — "
            + ", ".join(stage_names)
            + ". Blend these tones rather than defaulting to one: "
            + " ".join(c["toneGuidance"] for c in contexts)
        ),
        "topicsToEmphasize": emphasize,
        "topicsToDeemphasize": deemphasize,
    }


# ---------------------------------------------------------------------------
# Composed outputs
# ---------------------------------------------------------------------------

def numerology_profile(full_name: str, dob: date, year: int | None = None) -> dict:
    year = year or date.today().year
    return {
        "lifePath": life_path(dob),
        "expression": expression(full_name),
        "soulUrge": soul_urge(full_name),
        "personality": personality(full_name),
        "personalYear": personal_year(dob, year),
        "year": year,
    }


def full_profile(
    full_name: str,
    dob: date,
    birth_time: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    tz_offset: float | None = None,
    life_stages: list[str] | None = None,
) -> dict:
    today = date.today()
    age = calculate_age(dob, today)
    rising = (
        rising_sign(dob, birth_time, latitude, longitude, tz_offset)
        if birth_time and latitude is not None and longitude is not None
        else None
    )
    return {
        "input": {
            "fullName": full_name,
            "dateOfBirth": dob.isoformat(),
            "birthTime": birth_time,
            "latitude": latitude,
            "longitude": longitude,
            "timezoneOffsetHours": tz_offset,
        },
        "age": age,
        "currentYear": today.year,
        "numerology": numerology_profile(full_name, dob, today.year),
        "westernAstro": {
            "sunSign": sun_sign(dob, birth_time, tz_offset),
            "moonSign": moon_sign(dob, birth_time, tz_offset),
            "risingSign": rising,
        },
        "chineseZodiac": chinese_zodiac(dob),
        "lifeStageContext": classify_life_stage(age, life_stages or ["prefer_not_to_say"]),
    }


def daily_reading_data(full_name: str, dob: date, on: date | None = None) -> dict:
    """Everything the daily message is built from. Deterministic — the same
    person on the same date always gets the same numbers."""
    on = on or date.today()
    return {
        "date": on.isoformat(),
        "personalDay": personal_day(dob, on),
        "personalMonth": personal_month(dob, on),
        "personalYear": personal_year(dob, on.year),
        "universalDay": universal_day(on),
        "lifePath": life_path(dob),
        "expression": expression(full_name) if full_name else None,
        "transitMoonSign": SIGNS[
            int(moon_longitude(julian_day(datetime(on.year, on.month, on.day, 12, tzinfo=timezone.utc))) // 30) % 12
        ],
        "moonPhase": moon_phase(on),
        "sunSeason": sun_sign(on)["sign"],
        "dayPillar": day_pillar(on),
        "natalSunSign": sun_sign(dob)["sign"],
        "chineseAnimal": chinese_zodiac(dob)["animal"],
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Cosmic Blueprint calculation engine")
    sub = parser.add_subparsers(dest="command", required=True)

    profile_cmd = sub.add_parser("profile", help="Full cosmic profile")
    profile_cmd.add_argument("--name", required=True)
    profile_cmd.add_argument("--dob", required=True, help="YYYY-MM-DD")
    profile_cmd.add_argument("--time", help="HH:MM local birth time")
    profile_cmd.add_argument("--lat", type=float)
    profile_cmd.add_argument("--lon", type=float)
    profile_cmd.add_argument("--tz", type=float, help="UTC offset in hours at birth")
    profile_cmd.add_argument("--stages", nargs="*", default=["prefer_not_to_say"])

    numbers_cmd = sub.add_parser("numbers", help="Numerology only")
    numbers_cmd.add_argument("--name", required=True)
    numbers_cmd.add_argument("--dob", required=True)
    numbers_cmd.add_argument("--year", type=int)

    daily_cmd = sub.add_parser("daily", help="Daily reading inputs")
    daily_cmd.add_argument("--dob", required=True)
    daily_cmd.add_argument("--name", default="")
    daily_cmd.add_argument("--date", help="YYYY-MM-DD, defaults to today")

    args = parser.parse_args(argv)

    if args.command == "profile":
        result = full_profile(
            args.name, parse_date(args.dob), args.time,
            args.lat, args.lon, args.tz, args.stages,
        )
    elif args.command == "numbers":
        result = numerology_profile(args.name, parse_date(args.dob), args.year)
    else:
        result = daily_reading_data(
            args.name, parse_date(args.dob),
            parse_date(args.date) if args.date else None,
        )

    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
