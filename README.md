# CircleMap

同人誌展覽會場地圖的資料格式定義、攤位展開演算法與渲染元件。

## 專案結構

```
circle-map/
├── packages/
│   ├── @circlemap/core          # 核心邏輯（純 TypeScript，無框架依賴）
│   └── @circlemap/react-viewer  # 唯讀地圖渲染元件（React + Konva）
└── apps/
    ├── editor/                  # 地圖編輯器（Vite + React）
    └── demo/                    # 展示用 demo
```

## Packages

### `@circlemap/core`

純 TypeScript 套件，包含：

- **schema.ts** — 地圖資料的型別定義（`MapData`, `BoothBlock`, `Venue` 等介面）
- **utils.ts** — `generateBoothsInBlock()`：根據 `BoothBlock` 設定展開出所有攤位的座標與標籤

### `@circlemap/react-viewer`

可嵌入的唯讀地圖 React 元件，依賴 `@circlemap/core`。

```tsx
import { MapViewer } from '@circlemap/react-viewer';

<MapViewer data={mapData} />
```

支援滾輪縮放、拖曳平移，自動配合容器大小。

## 資料格式

地圖資料（`MapData`）包含四個部分：

| 欄位 | 說明 |
|------|------|
| `venue` | 場地資訊：尺寸、外框多邊形、障礙物（柱子） |
| `facilities` | 設施：入口、出口、HQ、售票處、舞台… |
| `boothBlocks` | 攤位排：定義位置、方向、編號規則 |
| `specialZones` | 特殊區域：廠商贊助區等多邊形標示 |

### BoothBlock 攤位排

每個 `BoothBlock` 代表一整排攤位，透過 `layoutConfig` 描述排列方式：

```ts
{
  id: "b_A",
  type: "standard_row",
  prefix: "A",                          // 攤位前綴，如 A01, A02...
  position: { x: 10800, y: 4400 },      // 左上角座標
  size: { width: 240, height: 2640 },   // 整排總尺寸
  orientation: "vertical",              // 排列方向
  layoutConfig: {
    columns: 2,                         // 幾列（1 = 單排, 2 = 背對背雙排）
    startNumber: 1,
    endNumber: 44,
    numberingDirection: "bottom_to_top_then_top_to_bottom"
  },
  skips: [22, 23]                       // 跳過的編號（通道空位）
}
```

## 開發

```bash
# 安裝所有依賴
yarn install

# 啟動 editor
yarn workspace editor dev

# 或透過 Turborepo 同時啟動所有 app
yarn turbo dev
```

## 技術棧

- [Turborepo](https://turbo.build/) — monorepo 管理
- [Vite](https://vitejs.dev/) — 前端建置工具
- [React](https://react.dev/) + [Konva](https://konvajs.org/) — Canvas 渲染
- [Zustand](https://zustand-demo.pmnd.rs/) — 編輯器狀態管理
