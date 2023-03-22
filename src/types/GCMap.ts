export const enum Edge {
  None = 0,
  Wall = 1,
  Door = 2,
  Door_Locked = 3,
  Door_Hidden = 4,
  Door_OneWayLU = 5,
  Door_Hidden_OneWayLU = 6,
  Wall_OneWayLU = 7,
  Door_OneWayRD = 8,
  Door_Hidden_OneWayRD = 9,
  Wall_OneWayRD = 10,
  Door_Empty = 12,
  Wall_Secret = 13,
  Door_Trapped = 14,
  Door_HalfL = 15,
  Door_HalfR = 16,
  Wall_HalfL = 17,
  Wall_HalfR = 18,
  ButtonLU = 19,
  ButtonRD = 20,
  TorchLU = 21,
  TorchRD = 22,
  LeverLU = 23,
  LeverRD = 24,
  Bars = 25,
  TorchDouble = 26,
  Gate = 27,
  Message = 28,
  Door_Secret = 29,
  NicheLU = 30,
  NicheRD = 31,
  Keyhole = 32,
  Door_Box = 33,
  Wall_Trapped = 34,
}

export const enum InBlockEdge {
  None = 0,
  Horizontal = 1,
  Vertical = 2,
  DiagonalLeft = 3,
  DiagonalRight = 4,
  CornerNW = 5,
  CornerNE = 6,
  CornerSE = 7,
  CornerSW = 8,
}

export const enum Marker {
  None = 0,
  StairsUp = 1,
  StairsDown = 2,
  NPC = 3,
  TeleportIn = 4,
  TeleportOut = 5,
  RotatingRoom = 6,
  Pit_Open = 7,
  Death = 8,
  Entrance = 9,
  Exit = 10,
  Turntable = 11,
  Chest_Open = 12,
  Key = 13,
  Monster = 14,
  Switch = 15,
  Fountain = 16,
  SavePoint = 17,
  Target = 18,
  Pressure = 19,
  Pentagram = 20,
  Elevator = 21,
  Zap = 22,
  Unknown = 23,
  Event = 24,
  Message = 25,
  LadderUp = 26,
  LadderDown = 27,
  StairsFacingNorth = 34,
  StairsFacingEast = 35,
  StairsFacingSouth = 36,
  StairsFacingWest = 37,
  Wardrobe = 38,
  Coin_Single = 39,
  Bookshelf = 40,
  ShapeCross = 41,
  LadderTwoWays = 44,
  Chest_Closed = 46,
  Chest_Trapped = 47,
  Chest_Locked = 48,
  Ore = 49,
  Pit_Covered = 50,
  Pit_Trapped = 51,
  Well = 52,
  ShapeTriangle = 53,
  ShapeSmallSquare = 54,
  ShapeSquare = 55,
  ShapeSmallCircle = 56,
  ShapeCircle = 57,
  GemDiamond = 58,
  GemEmerald = 59,
  GemRuby = 60,
  GemCrystal = 61,
  ArrowUp = 62,
  ArrowRight = 63,
  ArrowDown = 64,
  ArrowLeft = 65,
  Sack = 66,
  Map = 67,
  Purse = 68,
  Barrel = 69,
  RampUp = 70,
  RampDown = 71,
  Boulder = 72,
  Stone = 73,
  PressurePlateAnd_Stone = 74,
  ArrowLR = 78,
  ArrowUD = 79,
  ArrowDiagUL = 80,
  ArrowDiagUR = 81,
  ArrowDiagDR = 82,
  ArrowDiagDL = 83,
  DoubleArrowULDR = 84,
  DoubleArrowURDL = 85,
  Vial = 86,
  Coffin = 87,
  CoffinWithCruciform = 88,
  Tree = 97,
  Shop = 98,
  Bed = 99,
  Tavern = 100,
  Health = 101,
  MoveableBlock = 102,
  TrainerOrTeacher = 103,
  Skull = 104,
  Bones = 105,
  Boat = 106,
  Bridge = 107,
  Signpost = 108,
  Pillar = 109,
  Armor = 110,
  Grave = 111,
  Statue = 112,
  ArrowUL = 117,
  ArrowUR = 118,
  ArrowDL = 119,
  ArrowDR = 120,
  ArrowLU = 121,
  ArrowRU = 122,
  ArrowLD = 123,
  ArrowRD = 124,
  Weapons = 125,
  Boots = 126,
  Altar = 127,
  Food = 128,
  Scroll = 130,
  Book = 131,
  HarvestPlant = 132,
  TimberPile = 133,
  Doorway = 134,
  Tent = 135,
  Spring = 136,
}

export const enum Terrain {
  None = 0,
  PencilRegularA = 1,
  PencilRegularB = 2,
  PencilRegularC = 3,
  PencilRegularD = 4,
  PencilRegularE = 5,
  PencilRegularF = 6,
  PencilRegularG = 7,
  PencilRoughA = 10,
  PencilRoughB = 11,
  PencilRoughC = 12,
  PencilRoughD = 13,
  PencilRoughE = 14,
  PencilRoughF = 15,
  PencilDebrisA = 20,
  PencilDebrisB = 21,
  PencilDebrisC = 22,
  PencilDebrisD = 23,
  Inside = 31,
  Outside = 32,
  Water = 33,
  Lava = 34,
  Rock = 35,
  Vegetation = 36,
  Ooze = 38,
  Block = 39,
  Sand = 40,
  Wood = 41,
  PencilCrackedA = 50,
  PencilCrackedB = 51,
  PencilCrackedC = 52,
  PencilCrackedD = 53,
  PencilCrackedE = 54,
  PencilCrackedF = 55,
  PencilCrackedG = 56,
  PencilCrackedH = 57,
  PencilCrackedI = 58,
  PencilCrackedJ = 59,
  Metal = 75,
  Trees = 76,
  Snow = 95,
  Mountain = 113,
  Track = 115,
}

export interface Bounds {
  /** The x co-ordinate of the left-most occupied tile. */
  x0: number;

  /** The y co-ordinate of the top or bottom most occupied tile as defined by the co-ordinate space specified by the origin attribute of the setup object/element. */
  y0: number;

  /** The number of tiles in each row. */
  width: number;

  /** The number of rows from y0 to the last occupied row on this floor. */
  height: number;
}

export interface Cell {
  /** The index of the custom tile used by this cell. A value from 0 to 7999. Only color custom tiles can be used with tilemaps. This attribute will be omitted for empty cells and the cell can be interpreted as having an empty or default appearance if required. */
  i?: number;

  /** A string of characters that indicate special attribute flags assigned to this tile. Multiple characters can be present and will always appear in the order listed. Meanings are:
    • h Tile is horizontally flipped.
    • v Tile is vertically flipped.
    • r Tile is rotated 90 degrees clockwise. */
  sp?: `${"h" | ""}${"v" | ""}${"r" | ""}`;
}

export interface Entry {
  /** The index number of the palette entry. */
  i: number;

  /** The color value of the entry expressed in HTML notation #RRGGBB. */
  rgb: string;

  /** If set to 1 this indicates a color that has been edited. */
  edit?: "1";
}

export interface Export {
  /** The friendly version number of Grid Cartographer used to export the document. This takes the form year.month.suffix. */
  from: string;

  /** The date of export in YYYY-MM-DD format. */
  date: string;

  /** The (local) time of export in HH:MM:SS format. */
  time: string;
}

export interface Floor {
  /** The number of the floor. Negative values are basements, zero is the ground floor and positive values are the floors above. */
  index: number;

  tiles: {
    bounds: Bounds;
    rows?: Row[];
  };

  notes: Note[];
}

export interface GCMap {
  export: Export;
  regions: Region[];
  palette?: Entry[];
}

export interface Note {
  /** The X co-ordinate of the note. */
  x: number;

  /** The Y co-ordinate of the note given in the co-ordinate space specified by the origin attribute of the setup element. */
  y: number;

  __data?: string;
}

export interface Region {
  /** The floor count of this region. Excluding ground floor if disabled. */
  floor_count: number;

  /** The index of the lowest floor. Negative values are basements. */
  lowest_floor: number;

  /** The shape of the grid used for all floors in this region. */
  grid_shape: "square" | "hexh" | "hexv";

  /** The name of a region or tilemap. */
  name: string;

  setup: {
    /** Either tl or bl which, respectively, specify either a top-left or bottom-left grid origin. */
    origin: "tl" | "bl";
  };

  floors: Floor[];
}

export interface Row {
  /** The offset to the first non-empty tile on this row. Calculate the absolute x position using bounds.x0 + start. */
  start: number;

  /** The y co-ordinate of the row in the co-ordinate space specified by the origin attribute of the setup element. */
  y: number;

  tdata: Tile[];
}

export interface Tile {
  /** A standard marker is present. */
  m?: Marker;

  /** A custom color marker is present. This is a value from 0 to 8191 corresponding to the index of the custom tile used in the color list. See the custom element for more information. */
  mcc?: number;

  /** A custom monochrome marker is present. This is a value from 0 to 8191 corresponding to the index of the custom tile used in the monochrome list. See the custom element for more information. */
  mcm?: number;

  /** The color of the marker layer. This is a palette index from 0 to 255. See the palette element below for more information. Note that color custom markers are not tinted and should ignore this value. */
  mc?: number;

  /** An in-block edge is present. */
  ibe?: "1";

  /** The style of the in-block edge of this tile. Corner edges don't have a style (only wall) and this attribute will not be present for these edges. */
  ibs?: InBlockEdge;

  /** The color of the in-block edge. This is a palette index from 0 to 255. See the palette element below for more information. */
  ibc?: number;

  /** A standard terrain type is present. */
  t?: Terrain;

  /** A custom monochrome terrain is present. This is a value from 0 to 7999 corresponding to the index of the custom tile used in the monochrome list. See the custom element for more information. */
  tcm?: number;

  /** A custom color terrain is present. This is a value from 0 to 7999 corresponding to the index of the custom tile used in the color list. See the custom element for more information. */
  tcc?: number;

  /** The color of the terrain layer. This is a palette index from 0 to 255. See the palette element section below for more information. Note that color custom terrain is not tinted and should ignore this value. */
  tc?: number;

  /** The style of the R edge of this tile. */
  r?: Edge;

  /** The style of the I edge of this tile. */
  i?: Edge;

  /** The style of the B edge of this tile. */
  b?: Edge;

  /** The color of the R edge. This is a palette index from 0 to 255. See the palette element section below for more information. See the tile data model document for the location of the R edge for the grid shape used. */
  rc?: number;

  /** The color of the I edge. This is a palette index from 0 to 255. See the palette element section below for more information. See the tile data model document for the location of the I edge for the grid shape used. */
  ic?: number;

  /** The color of the B edge. This is a palette index from 0 to 255. See the palette element section below for more information. See the tile data model document for the location of the B edge for the grid shape used. */
  bc?: number;

  /** If set to 1 this signifies the tile is dark. */
  d?: "1";

  /** A value composed from characters r, g and/or b that specify which of the three colored FX flags have been assigned to this tile. Multiple characters can be present and assigned to the tile. */
  fx?: string;

  /** If set to 1 this signifies the tile has a ceiling. */
  c?: "1";

  /** A string of characters that indicate special attribute flags assigned to this tile (custom tiles only). Multiple characters can be present and will always appear in the order listed. Meanings are:
    • h Tile is horizontally flipped.
    • v Tile is vertically flipped.
    • r Tile is rotated 90 degrees clockwise. */
  sp?: string;

  /** If the terrain snipper tool has been used on this tile to remove some part of the ground, this element is present. It can have one of two values: tl or br which represent whether the top/left or bottom/right of the tile is still visible. */
  snip?: "tl" | "br";

  /** Elevation of this tile, an integer value from 1 to 255. Tiles with an elevation of 0 will not have this attribute. */
  el?: string;
}
