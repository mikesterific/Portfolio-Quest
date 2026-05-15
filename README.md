# Portfolio-Quest

Interactive, RPG-inspired portfolio: explore a pixel-art style world that surfaces skills, projects, and résumé content. Built for the web with smooth motion and large-screen (HDMI) use in mind.

**Repository:** [github.com/mikesterific/Portfolio-Quest](https://github.com/mikesterific/Portfolio-Quest)

## Stack

- [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vite.dev/)
- [Phaser 3](https://phaser.io/) for 2D game views
- [three.js](https://threejs.org/) where 3D is used
- TypeScript, ESLint, Jest

## Prerequisites

- **Node.js** ≥ 18 (repo pins **20.19.1** in [`.nvmrc`](./.nvmrc); use `nvm use` if you use nvm)

## Setup

```sh
npm install
```

### Development server

```sh
npm run dev
```

### Production build

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

### Tests

```sh
npm run test
```

### Lint

```sh
npm run lint
```

## Editor notes

[VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if it is installed). Vue SFC types rely on `vue-tsc` for CLI checks and on Volar in the editor.

## Configuration

See the [Vite configuration reference](https://vite.dev/config/) and [`vite.config.ts`](./vite.config.ts).
