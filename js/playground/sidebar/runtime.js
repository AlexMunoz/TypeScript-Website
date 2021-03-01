define(["require", "exports", "../createUI", "../localizeWithFallback"], function (require, exports, createUI_1, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runWithCustomLogs = exports.clearLogs = exports.runPlugin = void 0;
    const allLogs = [];
    let offset = 0;
    let curLog = 0;
    let addedClearAction = false;
    const runPlugin = (i, utils) => {
        const plugin = {
            id: "logs",
            displayName: i("play_sidebar_logs"),
            willMount: (sandbox, container) => {
                if (!addedClearAction) {
                    const ui = createUI_1.createUI();
                    addClearAction(sandbox, ui, i);
                    addedClearAction = true;
                }
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement("div");
                    message.textContent = localizeWithFallback_1.localize("play_sidebar_logs_no_logs", "No logs");
                    message.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(message);
                }
                const errorUL = document.createElement("div");
                errorUL.id = "log-container";
                container.appendChild(errorUL);
                const logs = document.createElement("div");
                logs.id = "log";
                logs.innerHTML = allLogs.join('<hr />');
                errorUL.appendChild(logs);
            },
        };
        return plugin;
    };
    exports.runPlugin = runPlugin;
    const clearLogs = () => {
        offset += allLogs.length;
        allLogs.length = 0;
        const logs = document.getElementById("log");
        if (logs) {
            logs.textContent = "";
        }
    };
    exports.clearLogs = clearLogs;
    const runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById("empty-message-container");
        if (noLogs) {
            noLogs.style.display = "none";
        }
        rewireLoggingToElement(() => document.getElementById("log"), () => document.getElementById("log-container"), closure, true, i);
    };
    exports.runWithCustomLogs = runWithCustomLogs;
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        const rawConsole = console;
        closure.then(js => {
            const replace = {};
            bindLoggingFunc(replace, rawConsole, 'log', 'LOG', curLog);
            bindLoggingFunc(replace, rawConsole, 'debug', 'DBG', curLog);
            bindLoggingFunc(replace, rawConsole, 'warn', 'WRN', curLog);
            bindLoggingFunc(replace, rawConsole, 'error', 'ERR', curLog);
            replace['clear'] = exports.clearLogs;
            const console = Object.assign({}, rawConsole, replace);
            try {
                eval(js);
            }
            catch (error) {
                console.error(i("play_run_js_fail"));
                console.error(error);
            }
            curLog++;
        });
        function bindLoggingFunc(obj, raw, name, id, cur) {
            obj[name] = function (...objs) {
                var _a;
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = `[<span class="log-${name}">${id}</span>]: `;
                const eleContainerLog = eleOverflowLocator();
                const index = cur - offset;
                if (index >= 0) {
                    allLogs[index] = ((_a = allLogs[index]) !== null && _a !== void 0 ? _a : '') + prefix + output + "<br>";
                }
                eleLog.innerHTML = allLogs.join("<hr />");
                const scrollElement = eleContainerLog.parentElement;
                if (autoScroll && scrollElement) {
                    scrollToBottom(scrollElement);
                }
                raw[name](...objs);
            };
        }
        function scrollToBottom(element) {
            const overflowHeight = element.scrollHeight - element.clientHeight;
            const atBottom = element.scrollTop >= overflowHeight;
            if (!atBottom) {
                element.scrollTop = overflowHeight;
            }
        }
        const objectToText = (arg) => {
            const isObj = typeof arg === "object";
            let textRep = "";
            if (arg && arg.stack && arg.message) {
                // special case for err
                textRep = arg.message;
            }
            else if (arg === null) {
                textRep = "<span class='literal'>null</span>";
            }
            else if (arg === undefined) {
                textRep = "<span class='literal'>undefined</span>";
            }
            else if (typeof arg === "symbol") {
                textRep = `<span class='literal'>${String(arg)}</span>`;
            }
            else if (Array.isArray(arg)) {
                textRep = "[" + arg.map(objectToText).join("<span class='comma'>, </span>") + "]";
            }
            else if (typeof arg === "string") {
                textRep = '"' + arg + '"';
            }
            else if (isObj) {
                const name = arg.constructor && arg.constructor.name;
                // No one needs to know an obj is an obj
                const nameWithoutObject = name && name === "Object" ? "" : name;
                const prefix = nameWithoutObject ? `${nameWithoutObject}: ` : "";
                textRep = prefix + JSON.stringify(arg, null, 2);
            }
            else {
                textRep = String(arg);
            }
            return textRep;
        };
        function produceOutput(args) {
            return args.reduce((output, arg, index) => {
                const textRep = objectToText(arg);
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : "";
                return output + textRep + comma + "&nbsp;";
            }, "");
        }
    }
    const addClearAction = (sandbox, ui, i) => {
        const clearLogsAction = {
            id: "clear-logs-play",
            label: "Clear Playground Logs",
            keybindings: [sandbox.monaco.KeyMod.CtrlCmd | sandbox.monaco.KeyCode.KEY_K],
            contextMenuGroupId: "run",
            contextMenuOrder: 1.5,
            run: function () {
                exports.clearLogs();
                ui.flashInfo(i("play_clear_logs"));
            },
        };
        sandbox.editor.addAction(clearLogsAction);
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBS0EsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQzVCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFBO0lBRXJCLE1BQU0sU0FBUyxHQUFrQixDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUNuRCxNQUFNLE1BQU0sR0FBcUI7WUFDL0IsRUFBRSxFQUFFLE1BQU07WUFDVixXQUFXLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO1lBQ25DLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUNyQixNQUFNLEVBQUUsR0FBRyxtQkFBUSxFQUFFLENBQUE7b0JBQ3JCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO29CQUM5QixnQkFBZ0IsR0FBRyxJQUFJLENBQUE7aUJBQ3hCO2dCQUVELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JELGVBQWUsQ0FBQyxFQUFFLEdBQUcseUJBQXlCLENBQUE7b0JBQzlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRXRDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsK0JBQVEsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFD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QUFFLEVBQUU7UUFDMUQsTUFBTSxlQUFlLEdBQUc7WUFDdEIsRUFBRSxFQUFFLGlCQUFpQjtZQUNyQixLQUFLLEVBQUUsdUJBQXVCO1lBQzlCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFM0Usa0JBQWtCLEVBQUUsS0FBSztZQUN6QixnQkFBZ0IsRUFBRSxHQUFHO1lBRXJCLEdBQUcsRUFBRTtnQkFDSCxpQkFBUyxFQUFFLENBQUE7Z0JBQ1gsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFBO1lBQ3BDLENBQUM7U0FDRixDQUFBO1FBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDM0MsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2FuZGJveCB9IGZyb20gXCJ0eXBlc2NyaXB0bGFuZy1vcmcvc3RhdGljL2pzL3NhbmRib3hcIlxuaW1wb3J0IHsgUGxheWdyb3VuZFBsdWdpbiwgUGx1Z2luRmFjdG9yeSB9IGZyb20gXCIuLlwiXG5pbXBvcnQgeyBjcmVhdGVVSSwgVUkgfSBmcm9tIFwiLi4vY3JlYXRlVUlcIlxuaW1wb3J0IHsgbG9jYWxpemUgfSBmcm9tIFwiLi4vbG9jYWxpemVXaXRoRmFsbGJhY2tcIlxuXG5jb25zdCBhbGxMb2dzOiBzdHJpbmdbXSA9IFtdXG5sZXQgb2Zmc2V0ID0gMFxubGV0IGN1ckxvZyA9IDBcbmxldCBhZGRlZENsZWFyQWN0aW9uID0gZmFsc2VcblxuZXhwb3J0IGNvbnN0IHJ1blBsdWdpbjogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwibG9nc1wiLFxuICAgIGRpc3BsYXlOYW1lOiBpKFwicGxheV9zaWRlYmFyX2xvZ3NcIiksXG4gICAgd2lsbE1vdW50OiAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBpZiAoIWFkZGVkQ2xlYXJBY3Rpb24pIHtcbiAgICAgICAgY29uc3QgdWkgPSBjcmVhdGVVSSgpXG4gICAgICAgIGFkZENsZWFyQWN0aW9uKHNhbmRib3gsIHVpLCBpKVxuICAgICAgICBhZGRlZENsZWFyQWN0aW9uID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoYWxsTG9ncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29uc3Qgbm9FcnJvcnNNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSBcImVtcHR5LW1lc3NhZ2UtY29udGFpbmVyXCJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vRXJyb3JzTWVzc2FnZSlcblxuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gbG9jYWxpemUoXCJwbGF5X3NpZGViYXJfbG9nc19ub19sb2dzXCIsIFwiTm8gbG9nc1wiKVxuICAgICAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eS1wbHVnaW4tbWVzc2FnZVwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuYXBwZW5kQ2hpbGQobWVzc2FnZSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGVycm9yVUwuaWQgPSBcImxvZy1jb250YWluZXJcIlxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG5cbiAgICAgIGNvbnN0IGxvZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBsb2dzLmlkID0gXCJsb2dcIlxuICAgICAgbG9ncy5pbm5lckhUTUwgPSBhbGxMb2dzLmpvaW4oJzxociAvPicpXG4gICAgICBlcnJvclVMLmFwcGVuZENoaWxkKGxvZ3MpXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyTG9ncyA9ICgpID0+IHtcbiAgb2Zmc2V0ICs9IGFsbExvZ3MubGVuZ3RoXG4gIGFsbExvZ3MubGVuZ3RoID0gMFxuICBjb25zdCBsb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcbiAgaWYgKGxvZ3MpIHtcbiAgICBsb2dzLnRleHRDb250ZW50ID0gXCJcIlxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBydW5XaXRoQ3VzdG9tTG9ncyA9IChjbG9zdXJlOiBQcm9taXNlPHN0cmluZz4sIGk6IEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IG5vTG9ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1wdHktbWVzc2FnZS1jb250YWluZXJcIilcbiAgaWYgKG5vTG9ncykge1xuICAgIG5vTG9ncy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgfVxuXG4gIHJld2lyZUxvZ2dpbmdUb0VsZW1lbnQoXG4gICAgKCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIikhLFxuICAgICgpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nLWNvbnRhaW5lclwiKSEsXG4gICAgY2xvc3VyZSxcbiAgICB0cnVlLFxuICAgIGlcbiAgKVxufVxuXG4vLyBUaGFua3MgU086IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIwMjU2NzYwL2phdmFzY3JpcHQtY29uc29sZS1sb2ctdG8taHRtbC8zNTQ0OTI1NiMzNTQ0OTI1NlxuXG5mdW5jdGlvbiByZXdpcmVMb2dnaW5nVG9FbGVtZW50KFxuICBlbGVMb2NhdG9yOiAoKSA9PiBFbGVtZW50LFxuICBlbGVPdmVyZmxvd0xvY2F0b3I6ICgpID0+IEVsZW1lbnQsXG4gIGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPixcbiAgYXV0b1Njcm9sbDogYm9vbGVhbixcbiAgaTogRnVuY3Rpb25cbikge1xuXG4gIGNvbnN0IHJhd0NvbnNvbGUgPSBjb25zb2xlXG5cbiAgY2xvc3VyZS50aGVuKGpzID0+IHtcbiAgICBjb25zdCByZXBsYWNlID0ge30gYXMgYW55XG4gICAgYmluZExvZ2dpbmdGdW5jKHJlcGxhY2UsIHJhd0NvbnNvbGUsICdsb2cnLCAnTE9HJywgY3VyTG9nKVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCAnZGVidWcnLCAnREJHJywgY3VyTG9nKVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCAnd2FybicsICdXUk4nLCBjdXJMb2cpXG4gICAgYmluZExvZ2dpbmdGdW5jKHJlcGxhY2UsIHJhd0NvbnNvbGUsICdlcnJvcicsICdFUlInLCBjdXJMb2cpXG4gICAgcmVwbGFjZVsnY2xlYXInXSA9IGNsZWFyTG9nc1xuICAgIGNvbnN0IGNvbnNvbGUgPSBPYmplY3QuYXNzaWduKHt9LCByYXdDb25zb2xlLCByZXBsYWNlKVxuICAgIHRyeSB7XG4gICAgICBldmFsKGpzKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGkoXCJwbGF5X3J1bl9qc19mYWlsXCIpKVxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICB9XG4gICAgY3VyTG9nKytcbiAgfSlcblxuICBmdW5jdGlvbiBiaW5kTG9nZ2luZ0Z1bmMob2JqOiBhbnksIHJhdzogYW55LCBuYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIGN1cjogbnVtYmVyKSB7XG4gICAgb2JqW25hbWVdID0gZnVuY3Rpb24gKC4uLm9ianM6IGFueVtdKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBwcm9kdWNlT3V0cHV0KG9ianMpXG4gICAgICBjb25zdCBlbGVMb2cgPSBlbGVMb2NhdG9yKClcbiAgICAgIGNvbnN0IHByZWZpeCA9IGBbPHNwYW4gY2xhc3M9XCJsb2ctJHtuYW1lfVwiPiR7aWR9PC9zcGFuPl06IGBcbiAgICAgIGNvbnN0IGVsZUNvbnRhaW5lckxvZyA9IGVsZU92ZXJmbG93TG9jYXRvcigpXG4gICAgICBjb25zdCBpbmRleCA9IGN1ciAtIG9mZnNldFxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgYWxsTG9nc1tpbmRleF0gPSAoYWxsTG9nc1tpbmRleF0gPz8gJycpICsgcHJlZml4ICsgb3V0cHV0ICsgXCI8YnI+XCJcbiAgICAgIH1cbiAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzLmpvaW4oXCI8aHIgLz5cIilcbiAgICAgIGNvbnN0IHNjcm9sbEVsZW1lbnQgPSBlbGVDb250YWluZXJMb2cucGFyZW50RWxlbWVudFxuICAgICAgaWYgKGF1dG9TY3JvbGwgJiYgc2Nyb2xsRWxlbWVudCkge1xuICAgICAgICBzY3JvbGxUb0JvdHRvbShzY3JvbGxFbGVtZW50KVxuICAgICAgfVxuICAgICAgcmF3W25hbWVdKC4uLm9ianMpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2Nyb2xsVG9Cb3R0b20oZWxlbWVudDogRWxlbWVudCkge1xuICAgIGNvbnN0IG92ZXJmbG93SGVpZ2h0ID0gZWxlbWVudC5zY3JvbGxIZWlnaHQgLSBlbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGNvbnN0IGF0Qm90dG9tID0gZWxlbWVudC5zY3JvbGxUb3AgPj0gb3ZlcmZsb3dIZWlnaHRcbiAgICBpZiAoIWF0Qm90dG9tKSB7XG4gICAgICBlbGVtZW50LnNjcm9sbFRvcCA9IG92ZXJmbG93SGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb2JqZWN0VG9UZXh0ID0gKGFyZzogYW55KTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBpc09iaiA9IHR5cGVvZiBhcmcgPT09IFwib2JqZWN0XCJcbiAgICBsZXQgdGV4dFJlcCA9IFwiXCJcbiAgICBpZiAoYXJnICYmIGFyZy5zdGFjayAmJiBhcmcubWVzc2FnZSkge1xuICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciBlcnJcbiAgICAgIHRleHRSZXAgPSBhcmcubWVzc2FnZVxuICAgIH0gZWxzZSBpZiAoYXJnID09PSBudWxsKSB7XG4gICAgICB0ZXh0UmVwID0gXCI8c3BhbiBjbGFzcz0nbGl0ZXJhbCc+bnVsbDwvc3Bhbj5cIlxuICAgIH0gZWxzZSBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRleHRSZXAgPSBcIjxzcGFuIGNsYXNzPSdsaXRlcmFsJz51bmRlZmluZWQ8L3NwYW4+XCJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09IFwic3ltYm9sXCIpIHtcbiAgICAgIHRleHRSZXAgPSBgPHNwYW4gY2xhc3M9J2xpdGVyYWwnPiR7U3RyaW5nKGFyZyl9PC9zcGFuPmBcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuICAgICAgdGV4dFJlcCA9IFwiW1wiICsgYXJnLm1hcChvYmplY3RUb1RleHQpLmpvaW4oXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiKSArIFwiXVwiXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0ZXh0UmVwID0gJ1wiJyArIGFyZyArICdcIidcbiAgICB9IGVsc2UgaWYgKGlzT2JqKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXJnLmNvbnN0cnVjdG9yICYmIGFyZy5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICAvLyBObyBvbmUgbmVlZHMgdG8ga25vdyBhbiBvYmogaXMgYW4gb2JqXG4gICAgICBjb25zdCBuYW1lV2l0aG91dE9iamVjdCA9IG5hbWUgJiYgbmFtZSA9PT0gXCJPYmplY3RcIiA/IFwiXCIgOiBuYW1lXG4gICAgICBjb25zdCBwcmVmaXggPSBuYW1lV2l0aG91dE9iamVjdCA/IGAke25hbWVXaXRob3V0T2JqZWN0fTogYCA6IFwiXCJcbiAgICAgIHRleHRSZXAgPSBwcmVmaXggKyBKU09OLnN0cmluZ2lmeShhcmcsIG51bGwsIDIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRSZXAgPSBTdHJpbmcoYXJnKVxuICAgIH1cbiAgICByZXR1cm4gdGV4dFJlcFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvZHVjZU91dHB1dChhcmdzOiBhbnlbXSkge1xuICAgIHJldHVybiBhcmdzLnJlZHVjZSgob3V0cHV0OiBhbnksIGFyZzogYW55LCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgdGV4dFJlcCA9IG9iamVjdFRvVGV4dChhcmcpXG4gICAgICBjb25zdCBzaG93Q29tbWEgPSBpbmRleCAhPT0gYXJncy5sZW5ndGggLSAxXG4gICAgICBjb25zdCBjb21tYSA9IHNob3dDb21tYSA/IFwiPHNwYW4gY2xhc3M9J2NvbW1hJz4sIDwvc3Bhbj5cIiA6IFwiXCJcbiAgICAgIHJldHVybiBvdXRwdXQgKyB0ZXh0UmVwICsgY29tbWEgKyBcIiZuYnNwO1wiXG4gICAgfSwgXCJcIilcbiAgfVxufVxuXG5jb25zdCBhZGRDbGVhckFjdGlvbiA9IChzYW5kYm94OiBTYW5kYm94LCB1aTogVUksIGk6IGFueSkgPT4ge1xuICBjb25zdCBjbGVhckxvZ3NBY3Rpb24gPSB7XG4gICAgaWQ6IFwiY2xlYXItbG9ncy1wbGF5XCIsXG4gICAgbGFiZWw6IFwiQ2xlYXIgUGxheWdyb3VuZCBMb2dzXCIsXG4gICAga2V5YmluZGluZ3M6IFtzYW5kYm94Lm1vbmFjby5LZXlNb2QuQ3RybENtZCB8IHNhbmRib3gubW9uYWNvLktleUNvZGUuS0VZX0tdLFxuXG4gICAgY29udGV4dE1lbnVHcm91cElkOiBcInJ1blwiLFxuICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcblxuICAgIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJMb2dzKClcbiAgICAgIHVpLmZsYXNoSW5mbyhpKFwicGxheV9jbGVhcl9sb2dzXCIpKVxuICAgIH0sXG4gIH1cblxuICBzYW5kYm94LmVkaXRvci5hZGRBY3Rpb24oY2xlYXJMb2dzQWN0aW9uKVxufVxuIl19