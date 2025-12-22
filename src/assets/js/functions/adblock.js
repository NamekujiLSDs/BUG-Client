const { app, ipcMain, Menu, protocol, BrowserWindow } = require("electron")
const path = require('path');
const { autoUpdater } = require("electron-updater")
const localShortcut = require("electron-localshortcut")
const log = require("electron-log")
const store = require("electron-store")
const fs = require("fs")

// ■ 追加: 簡易的な広告ブロッカークラス
module.exports = class SimpleAdBlocker {
    constructor(filePath) {
        this.rules = [];
        this.loadRules(filePath);
    }

    loadRules(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                log.warn(`[AdBlock] File not found: ${filePath}`);
                return;
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split(/\r?\n/);

            lines.forEach(line => {
                line = line.trim();
                // コメント、空行、コスメティックフィルタ(##)は除外
                if (!line || line.startsWith('!') || line.startsWith('#') || line.includes('##')) return;

                try {
                    let pattern = line;
                    // uBlock形式を簡易的な正規表現に変換
                    if (pattern.startsWith('||')) {
                        // ||example.com^ -> ドメイン開始一致
                        pattern = `^https?:\\/\\/([\\w-]+\\.)*${this.escapeRegExp(pattern.slice(2).replace('^', ''))}([/?#].*)?$`;
                    } else if (pattern.startsWith('|')) {
                        // |http... -> 完全一致開始
                        pattern = `^${this.escapeRegExp(pattern.slice(1))}`;
                    } else {
                        // 単純な文字列 -> 部分一致
                        pattern = this.escapeRegExp(pattern);
                    }

                    pattern = pattern.replace(/\\\^/g, '([^a-zA-Z0-9_\\-.%]|$)'); // ^ セパレータ
                    pattern = pattern.replace(/\\\*/g, '.*'); // * ワイルドカード

                    this.rules.push(new RegExp(pattern, 'i'));
                } catch (e) {
                    log.warn(`[AdBlock] Failed to parse rule: ${line}`, e);
                }
            });
            log.info(`[AdBlock] Loaded ${this.rules.length} rules.`);
        } catch (e) {
            log.error('[AdBlock] Error loading rules:', e);
        }
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    shouldBlock(url) {
        return this.rules.some(rule => rule.test(url));
    }
}