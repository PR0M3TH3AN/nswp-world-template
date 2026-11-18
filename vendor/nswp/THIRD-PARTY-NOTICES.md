# Third-party notices

The code in this repository is MIT licensed (`LICENSE`). When it is built into
the files other projects copy (`nswp-core.js`, the SDK's `sdk/*.js`, and
`nswp-cli.js`), those files also contain the libraries below. Each keeps its
own licence. Their short notices are left in the built files; this page lists
them in one place.

| Library | Used for | Licence | By |
|---|---|---|---|
| [@noble/curves](https://github.com/paulmillr/noble-curves) | Checking and making signatures | MIT | Paul Miller |
| [@noble/hashes](https://github.com/paulmillr/noble-hashes) | SHA-256 | MIT | Paul Miller |
| [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) | Encrypting room messages | MIT | Paul Miller |
| [@scure/base](https://github.com/paulmillr/scure-base) | bech32 and base64 | MIT | Paul Miller |
| [tldts](https://github.com/remusao/tldts) | Finding a site's registrable domain | MIT | Rémi Berson |
| [Public Suffix List](https://publicsuffix.org/), inside tldts | The list of domain suffixes | MPL 2.0 | Mozilla Foundation |
| [xterm.js](https://github.com/xtermjs/xterm.js) (`@xterm/headless`) | Reading what a terminal program writes, in `nswp-sdk/terminal` only | MIT | The xterm.js authors |
| [werift](https://github.com/shinyoshiaki/werift-webrtc) | The direct connection, in the Bridge (`nswp-bridge.mjs`) only | MIT | shinyoshiaki |

Not built in, and supplied by whoever uses the SDK:

| Library | Used for | Licence | By |
|---|---|---|---|
| [three.js](https://threejs.org/) | Drawing, in `nswp-sdk/three` and `nswp-sdk/home` | MIT | three.js authors |
| [IWER](https://github.com/meta-quest/immersive-web-emulation-runtime) | Pretending to be a headset, for tests (`?xr=emulate`) | MIT | Meta Platforms |

The MIT licence, which all but one of these use:

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

The Public Suffix List is used unmodified, as tldts ships it. Its source is at
<https://publicsuffix.org/list/>, under the Mozilla Public License 2.0:
<https://www.mozilla.org/MPL/2.0/>.
