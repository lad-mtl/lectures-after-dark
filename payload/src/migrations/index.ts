import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260908_194006 from './20260908_194006'
import * as migration_20260908_201610 from './20260908_201610'
import * as migration_20261106_214957_api_keys from './20261106_214957_api_keys'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260908_194006.up,
    down: migration_20260908_194006.down,
    name: '20260908_194006',
  },
  {
    up: migration_20260908_201610.up,
    down: migration_20260908_201610.down,
    name: '20260908_201610',
  },
  {
    up: migration_20261106_214957_api_keys.up,
    down: migration_20261106_214957_api_keys.down,
    name: '20261106_214957_api_keys',
  },
]
