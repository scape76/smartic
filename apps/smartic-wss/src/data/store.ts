import { Room } from "@smartic/types";
import { roomStatus } from "../types";

export const START_GAME_PLAYERS_AMOUNT = 2;

export const rooms = new Map<string, Room>();

// race id - Promise
export const activeGameloops = new Map<string, Promise<void>>();

export const words = [
  "Saturn",
  "Segway",
  "Slinky",
  "Sudoku",
  "Tarzan",
  "Tetris",
  "Tweety",
  "Uranus",
  "Wall-e",
  "action",
  "airbag",
  "almond",
  "alpaca",
  "anchor",
  "archer",
  "armpit",
  "baboon",
  "badger",
  "bakery",
  "ballet",
  "bamboo",
  "banana",
  "banker",
  "barber",
  "barrel",
  "basket",
  "battle",
  "beanie",
  "beaver",
  "beetle",
  "bellow",
  "betray",
  "bleach",
  "booger",
  "border",
  "bottle",
  "bounce",
  "braces",
  "branch",
  "breath",
  "bridge",
  "bronze",
  "bruise",
  "bubble",
  "bucket",
  "bullet",
  "bumper",
  "butler",
  "butter",
  "button",
  "cactus",
  "camera",
  "canary",
  "candle",
  "cannon",
  "canyon",
  "carpet",
  "carrot",
  "casino",
  "caviar",
  "cement",
  "cheeks",
  "cheese",
  "cherry",
  "church",
  "cicada",
  "cinema",
  "circle",
  "circus",
  "clover",
  "cocoon",
  "coffee",
  "coffin",
  "collar",
  "comedy",
  "cookie",
  "copper",
  "corner",
  "corpse",
  "cotton",
  "cousin",
  "cowboy",
  "coyote",
  "crayon",
  "credit",
  "cringe",
  "cruise",
  "cuckoo",
  "cyborg",
  "cymbal",
  "dagger",
  "desert",
  "diaper",
  "dinner",
  "doctor",
  "dollar",
  "donkey",
  "double",
  "dragon",
  "drawer",
  "driver",
  "earwax",
  "embers",
  "engine",
  "eraser",
  "eskimo",
  "fabric",
  "facade",
  "family",
  "farmer",
  "father",
  "faucet",
  "filter",
  "finger",
  "flower",
  "folder",
  "forest",
  "fossil",
  "fridge",
  "galaxy",
  "garage",
  "garden",
  "garlic",
  "gender",
  "gentle",
  "geyser",
  "goatee",
  "goblin",
  "grapes",
  "gravel",
  "grumpy",
  "guitar",
  "hacker",
  "hammer",
  "handle",
  "hanger",
  "harbor",
  "hazard",
  "health",
  "helmet",
  "hermit",
  "hippie",
  "hobbit",
  "hockey",
  "hunger",
  "hunter",
  "hurdle",
  "iPhone",
  "icicle",
  "impact",
  "insect",
  "inside",
];