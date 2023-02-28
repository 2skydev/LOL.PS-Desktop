![image](https://user-images.githubusercontent.com/43225384/221976059-4f5cac02-0de0-4b4b-a314-ea3ac5583049.png)

# LOL.PS Desktop

LOL.PS에서 데스크탑 앱을 내주지 않아서 직접 만들게 되었습니다.<br />
해당 프로젝트는 개인 토이 프로젝트로 개발 기간은 마구잡이일 경우가 있습니다.

<br />

## 사용한 프레임워크, 라이브러리

- App framework: [`electron`](https://www.electronjs.org/)
- App build tool: [`electron-builder`](https://www.electron.build/)
- App storage: [`electron-store`](https://github.com/sindresorhus/electron-store)
- App auto updater: [`electron-updater`](https://www.electron.build/auto-update)
- Bundle tool: [`vite`](https://vitejs.dev/)
- Frontend framework: `react` + `typescript`
- Code style: `eslint` + `prettier` + [`@trivago/prettier-plugin-sort-imports`](https://github.com/trivago/prettier-plugin-sort-imports)
- File system based router: [`react-router-dom v6`](https://reactrouter.com/docs/en/v6) + custom (src/components/FileSystemRoutes)
- CSS: [`styled-components`](https://styled-components.com/)
- State management library: [`recoil`](https://hookstate.js.org/)
- Date: [`dayjs`](https://day.js.org/)

<br />

## 시작하기

#### dev mode

```bash
yarn dev
```

#### vite & electron build (현재 OS기준)

```bash
yarn build
```

#### vite & electron build (모든 OS기준)

```bash
yarn build:all
```

<br />

## 스크린샷들

![image](https://user-images.githubusercontent.com/43225384/221976059-4f5cac02-0de0-4b4b-a314-ea3ac5583049.png)

