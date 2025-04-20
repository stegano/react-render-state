# React Render State
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-) <!-- ALL-CONTRIBUTORS-BADGE:END --> ![NPM License](https://img.shields.io/npm/l/react-render-state) ![NPM Downloads](https://img.shields.io/npm/dw/react-render-state)

React Render State: This hook allows you to declaratively define components that will be rendered based on the data processing state.

## Installation

The easiest way to install [`react-render-state`](https://www.npmjs.com/package/react-render-state) is with [npm](https://www.npmjs.com/).

```bash
npm install react-render-state
```

Alternately, download the source.

```bash
git clone https://github.com/stegano/react-render-state.git
```

## Quick Start

The `useRenderState` hook enables a declarative approach to display components based on data processing status. 

```tsx
import { useCallback, useEffect } from 'react';
import { useRenderState } from 'react-render-state';

export const App = () => {
  const [render, handleData] = useRenderState<string, Error>();

  useEffect(() => {
    handleData(async () => {
      return 'Hello World';
    });
  }, [handleData]);

  return render(
    (data) => <div>Completed({data})</div>,
    () => <p>Idle</p>,
    () => <p>Loading..</p>,
    (error) => <p>Error, Oops something went wrong.. :(, ({error.message})</p>
  );
};
```
Demo: https://stackblitz.com/edit/stackblitz-starters-uv8yjs

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stegano"><img src="https://avatars.githubusercontent.com/u/11916476?v=4?s=100" width="100px;" alt="Yongwoo Jung"/><br /><sub><b>Yongwoo Jung</b></sub></a><br /><a href="https://github.com/stegano/react-render-state/commits?author=stegano" title="Code">💻</a> <a href="#ideas-stegano" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!