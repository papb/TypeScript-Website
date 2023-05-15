define(["require", "exports", "../createUI", "../localizeWithFallback"], function (require, exports, createUI_1, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runWithCustomLogs = exports.clearLogs = exports.runPlugin = void 0;
    let allLogs = [];
    let addedClearAction = false;
    const cancelButtonSVG = `
<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="6" cy="7" r="5" stroke-width="2"/>
<line x1="0.707107" y1="1.29289" x2="11.7071" y2="12.2929" stroke-width="2"/>
</svg>
`;
    const runPlugin = (i, utils) => {
        const plugin = {
            id: "logs",
            displayName: i("play_sidebar_logs"),
            willMount: (sandbox, container) => {
                const ui = (0, createUI_1.createUI)();
                const clearLogsAction = {
                    id: "clear-logs-play",
                    label: "Clear Playground Logs",
                    keybindings: [sandbox.monaco.KeyMod.CtrlCmd | sandbox.monaco.KeyCode.KeyK],
                    contextMenuGroupId: "run",
                    contextMenuOrder: 1.5,
                    run: function () {
                        (0, exports.clearLogs)();
                        ui.flashInfo(i("play_clear_logs"));
                    },
                };
                if (!addedClearAction) {
                    sandbox.editor.addAction(clearLogsAction);
                    addedClearAction = true;
                }
                const errorUL = document.createElement("div");
                errorUL.id = "log-container";
                container.appendChild(errorUL);
                const logs = document.createElement("div");
                logs.id = "log";
                logs.innerHTML = allLogs.join("<hr />");
                errorUL.appendChild(logs);
                const logToolsContainer = document.createElement("div");
                logToolsContainer.id = "log-tools";
                container.appendChild(logToolsContainer);
                const clearLogsButton = document.createElement("div");
                clearLogsButton.id = "clear-logs-button";
                clearLogsButton.innerHTML = cancelButtonSVG;
                clearLogsButton.onclick = e => {
                    e.preventDefault();
                    clearLogsAction.run();
                    const filterTextBox = document.getElementById("filter-logs");
                    filterTextBox.value = "";
                };
                logToolsContainer.appendChild(clearLogsButton);
                const filterTextBox = document.createElement("input");
                filterTextBox.id = "filter-logs";
                filterTextBox.placeholder = i("play_sidebar_tools_filter_placeholder");
                filterTextBox.addEventListener("input", (e) => {
                    const inputText = e.target.value;
                    const eleLog = document.getElementById("log");
                    eleLog.innerHTML = allLogs
                        .filter(log => {
                        const userLoggedText = log.substring(log.indexOf(":") + 1, log.indexOf("&nbsp;<br>"));
                        return userLoggedText.includes(inputText);
                    })
                        .join("<hr />");
                    if (inputText === "") {
                        const logContainer = document.getElementById("log-container");
                        logContainer.scrollTop = logContainer.scrollHeight;
                    }
                });
                logToolsContainer.appendChild(filterTextBox);
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement("div");
                    message.textContent = (0, localizeWithFallback_1.localize)("play_sidebar_logs_no_logs", "No logs");
                    message.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(message);
                    errorUL.style.display = "none";
                    logToolsContainer.style.display = "none";
                }
            },
        };
        return plugin;
    };
    exports.runPlugin = runPlugin;
    const clearLogs = () => {
        allLogs = [];
        const logs = document.getElementById("log");
        if (logs) {
            logs.textContent = "";
        }
    };
    exports.clearLogs = clearLogs;
    const runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById("empty-message-container");
        const logContainer = document.getElementById("log-container");
        const logToolsContainer = document.getElementById("log-tools");
        if (noLogs) {
            noLogs.style.display = "none";
            logContainer.style.display = "block";
            logToolsContainer.style.display = "flex";
        }
        rewireLoggingToElement(() => document.getElementById("log"), () => document.getElementById("log-container"), closure, true, i);
    };
    exports.runWithCustomLogs = runWithCustomLogs;
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        const rawConsole = console;
        closure.then(js => {
            const replace = {};
            bindLoggingFunc(replace, rawConsole, "log", "LOG");
            bindLoggingFunc(replace, rawConsole, "debug", "DBG");
            bindLoggingFunc(replace, rawConsole, "warn", "WRN");
            bindLoggingFunc(replace, rawConsole, "error", "ERR");
            replace["clear"] = exports.clearLogs;
            const console = Object.assign({}, rawConsole, replace);
            try {
                const safeJS = sanitizeJS(js);
                eval(safeJS);
            }
            catch (error) {
                console.error(i("play_run_js_fail"));
                console.error(error);
                if (error instanceof SyntaxError && /\bexport\b/u.test(error.message)) {
                    console.warn('Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground');
                }
            }
        });
        function bindLoggingFunc(obj, raw, name, id) {
            obj[name] = function (...objs) {
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = `[<span class="log-${name}">${id}</span>]: `;
                const eleContainerLog = eleOverflowLocator();
                allLogs.push(`${prefix}${output}<br>`);
                eleLog.innerHTML = allLogs.join("<hr />");
                if (autoScroll && eleContainerLog) {
                    eleContainerLog.scrollTop = eleContainerLog.scrollHeight;
                }
                raw[name](...objs);
            };
        }
        // Inline constants which are switched out at the end of processing
        const replacers = {
            "<span class='literal'>null</span>": "1231232131231231423434534534",
            "<span class='literal'>undefined</span>": "4534534534563567567567",
            "<span class='comma'>, </span>": "785y8345873485763874568734y535438",
        };
        const objectToText = (arg) => {
            const isObj = typeof arg === "object";
            let textRep = "";
            if (arg && arg.stack && arg.message) {
                // special case for err
                textRep = htmlEscape(arg.message);
            }
            else if (arg === null) {
                textRep = replacers["<span class='literal'>null</span>"];
            }
            else if (arg === undefined) {
                textRep = replacers["<span class='literal'>undefined</span>"];
            }
            else if (typeof arg === "symbol") {
                textRep = `<span class='literal'>${htmlEscape(String(arg))}</span>`;
            }
            else if (Array.isArray(arg)) {
                textRep = "[" + arg.map(objectToText).join(replacers["<span class='comma'>, </span>"]) + "]";
            }
            else if (arg instanceof Set) {
                const setIter = [...arg];
                textRep = `Set (${arg.size}) {` + setIter.map(objectToText).join(replacers["<span class='comma'>, </span>"]) + "}";
            }
            else if (arg instanceof Map) {
                const mapIter = [...arg.entries()];
                textRep =
                    `Map (${arg.size}) {` +
                        mapIter
                            .map(([k, v]) => `${objectToText(k)} => ${objectToText(v)}`)
                            .join(replacers["<span class='comma'>, </span>"]) +
                        "}";
            }
            else if (typeof arg === "string") {
                textRep = '"' + htmlEscape(arg) + '"';
            }
            else if (isObj) {
                const name = arg.constructor && arg.constructor.name;
                // No one needs to know an obj is an obj
                const nameWithoutObject = name && name === "Object" ? "" : htmlEscape(name);
                const prefix = nameWithoutObject ? `${nameWithoutObject}: ` : "";
                // JSON.stringify omits any keys with a value of undefined. To get around this, we replace undefined with the text __undefined__ and then do a global replace using regex back to keyword undefined
                textRep =
                    prefix +
                        JSON.stringify(arg, (_, value) => (value === undefined ? "__undefined__" : value), 2).replace(/"__undefined__"/g, "undefined");
                textRep = htmlEscape(textRep);
            }
            else {
                textRep = htmlEscape(String(arg));
            }
            return textRep;
        };
        function produceOutput(args) {
            let result = args.reduce((output, arg, index) => {
                const textRep = objectToText(arg);
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : "";
                return output + textRep + comma + " ";
            }, "");
            Object.keys(replacers).forEach(k => {
                result = result.replace(new RegExp(replacers[k], "g"), k);
            });
            return result;
        }
    }
    // The reflect-metadata runtime is available, so allow that to go through
    function sanitizeJS(code) {
        return code.replace(`import "reflect-metadata"`, "").replace(`require("reflect-metadata")`, "");
    }
    function htmlEscape(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUEsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQzFCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFBO0lBQzVCLE1BQU0sZUFBZSxHQUFHOzs7OztDQUt2QixDQUFBO0lBRU0sTUFBTSxTQUFTLEdBQWtCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ25ELE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsTUFBTTtZQUNWLFdBQVcsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUM7WUFDbkMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNoQyxNQUFNLEVBQUUsR0FBRyxJQUFBLG1CQUFRLEdBQUUsQ0FBQTtnQkFFckIsTUFBTSxlQUFlLEdBQUc7b0JBQ3RCLEVBQUUsRUFBRSxpQkFBaUI7b0JBQ3JCLEtBQUssRUFBRSx1QkFBdUI7b0JBQzlCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBRTFFLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLGdCQUFnQixFQUFFLEdBQUc7b0JBRXJCLEdBQUcsRUFBRTt3QkFDSCxJQUFBLGlCQUFTLEdBQUUsQ0FBQTt3QkFDWCxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7b0JBQ3BDLENBQUM7aUJBQ0YsQ0FBQTtnQkFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBO29CQUN6QyxnQkFBZ0IsR0FB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QUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3BFLENBQUMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxNQUFNLENBQUE7UUFDZixDQUFDO0lBQ0gsQ0FBQztJQUVELHlFQUF5RTtJQUN6RSxTQUFTLFVBQVUsQ0FBQyxJQUFZO1FBQzlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDakcsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLEdBQVc7UUFDN0IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2RyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGxheWdyb3VuZFBsdWdpbiwgUGx1Z2luRmFjdG9yeSB9IGZyb20gXCIuLlwiXG5pbXBvcnQgeyBjcmVhdGVVSSB9IGZyb20gXCIuLi9jcmVhdGVVSVwiXG5pbXBvcnQgeyBsb2NhbGl6ZSB9IGZyb20gXCIuLi9sb2NhbGl6ZVdpdGhGYWxsYmFja1wiXG5cbmxldCBhbGxMb2dzOiBzdHJpbmdbXSA9IFtdXG5sZXQgYWRkZWRDbGVhckFjdGlvbiA9IGZhbHNlXG5jb25zdCBjYW5jZWxCdXR0b25TVkcgPSBgXG48c3ZnIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMTMgMTNcIiBmaWxsPVwibm9uZVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbjxjaXJjbGUgY3g9XCI2XCIgY3k9XCI3XCIgcj1cIjVcIiBzdHJva2Utd2lkdGg9XCIyXCIvPlxuPGxpbmUgeDE9XCIwLjcwNzEwN1wiIHkxPVwiMS4yOTI4OVwiIHgyPVwiMTEuNzA3MVwiIHkyPVwiMTIuMjkyOVwiIHN0cm9rZS13aWR0aD1cIjJcIi8+XG48L3N2Zz5cbmBcblxuZXhwb3J0IGNvbnN0IHJ1blBsdWdpbjogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwibG9nc1wiLFxuICAgIGRpc3BsYXlOYW1lOiBpKFwicGxheV9zaWRlYmFyX2xvZ3NcIiksXG4gICAgd2lsbE1vdW50OiAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCB1aSA9IGNyZWF0ZVVJKClcblxuICAgICAgY29uc3QgY2xlYXJMb2dzQWN0aW9uID0ge1xuICAgICAgICBpZDogXCJjbGVhci1sb2dzLXBsYXlcIixcbiAgICAgICAgbGFiZWw6IFwiQ2xlYXIgUGxheWdyb3VuZCBMb2dzXCIsXG4gICAgICAgIGtleWJpbmRpbmdzOiBbc2FuZGJveC5tb25hY28uS2V5TW9kLkN0cmxDbWQgfCBzYW5kYm94Lm1vbmFjby5LZXlDb2RlLktleUtdLFxuXG4gICAgICAgIGNvbnRleHRNZW51R3JvdXBJZDogXCJydW5cIixcbiAgICAgICAgY29udGV4dE1lbnVPcmRlcjogMS41LFxuXG4gICAgICAgIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNsZWFyTG9ncygpXG4gICAgICAgICAgdWkuZmxhc2hJbmZvKGkoXCJwbGF5X2NsZWFyX2xvZ3NcIikpXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICghYWRkZWRDbGVhckFjdGlvbikge1xuICAgICAgICBzYW5kYm94LmVkaXRvci5hZGRBY3Rpb24oY2xlYXJMb2dzQWN0aW9uKVxuICAgICAgICBhZGRlZENsZWFyQWN0aW9uID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlcnJvclVMID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgZXJyb3JVTC5pZCA9IFwibG9nLWNvbnRhaW5lclwiXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZXJyb3JVTClcblxuICAgICAgY29uc3QgbG9ncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGxvZ3MuaWQgPSBcImxvZ1wiXG4gICAgICBsb2dzLmlubmVySFRNTCA9IGFsbExvZ3Muam9pbihcIjxociAvPlwiKVxuICAgICAgZXJyb3JVTC5hcHBlbmRDaGlsZChsb2dzKVxuXG4gICAgICBjb25zdCBsb2dUb29sc0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGxvZ1Rvb2xzQ29udGFpbmVyLmlkID0gXCJsb2ctdG9vbHNcIlxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGxvZ1Rvb2xzQ29udGFpbmVyKVxuXG4gICAgICBjb25zdCBjbGVhckxvZ3NCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBjbGVhckxvZ3NCdXR0b24uaWQgPSBcImNsZWFyLWxvZ3MtYnV0dG9uXCJcbiAgICAgIGNsZWFyTG9nc0J1dHRvbi5pbm5lckhUTUwgPSBjYW5jZWxCdXR0b25TVkdcbiAgICAgIGNsZWFyTG9nc0J1dHRvbi5vbmNsaWNrID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjbGVhckxvZ3NBY3Rpb24ucnVuKClcblxuICAgICAgICBjb25zdCBmaWx0ZXJUZXh0Qm94OiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlci1sb2dzXCIpXG4gICAgICAgIGZpbHRlclRleHRCb3ghLnZhbHVlID0gXCJcIlxuICAgICAgfVxuICAgICAgbG9nVG9vbHNDb250YWluZXIuYXBwZW5kQ2hpbGQoY2xlYXJMb2dzQnV0dG9uKVxuXG4gICAgICBjb25zdCBmaWx0ZXJUZXh0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpXG4gICAgICBmaWx0ZXJUZXh0Qm94LmlkID0gXCJmaWx0ZXItbG9nc1wiXG4gICAgICBmaWx0ZXJUZXh0Qm94LnBsYWNlaG9sZGVyID0gaShcInBsYXlfc2lkZWJhcl90b29sc19maWx0ZXJfcGxhY2Vob2xkZXJcIilcbiAgICAgIGZpbHRlclRleHRCb3guYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXRUZXh0ID0gZS50YXJnZXQudmFsdWVcblxuICAgICAgICBjb25zdCBlbGVMb2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKSFcbiAgICAgICAgZWxlTG9nLmlubmVySFRNTCA9IGFsbExvZ3NcbiAgICAgICAgICAuZmlsdGVyKGxvZyA9PiB7XG4gICAgICAgICAgICBjb25zdCB1c2VyTG9nZ2VkVGV4dCA9IGxvZy5zdWJzdHJpbmcobG9nLmluZGV4T2YoXCI6XCIpICsgMSwgbG9nLmluZGV4T2YoXCImbmJzcDs8YnI+XCIpKVxuICAgICAgICAgICAgcmV0dXJuIHVzZXJMb2dnZWRUZXh0LmluY2x1ZGVzKGlucHV0VGV4dClcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5qb2luKFwiPGhyIC8+XCIpXG5cbiAgICAgICAgaWYgKGlucHV0VGV4dCA9PT0gXCJcIikge1xuICAgICAgICAgIGNvbnN0IGxvZ0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nLWNvbnRhaW5lclwiKSFcbiAgICAgICAgICBsb2dDb250YWluZXIuc2Nyb2xsVG9wID0gbG9nQ29udGFpbmVyLnNjcm9sbEhlaWdodFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbG9nVG9vbHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZmlsdGVyVGV4dEJveClcblxuICAgICAgaWYgKGFsbExvZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG5vRXJyb3JzTWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgbm9FcnJvcnNNZXNzYWdlLmlkID0gXCJlbXB0eS1tZXNzYWdlLWNvbnRhaW5lclwiXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub0Vycm9yc01lc3NhZ2UpXG5cbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IGxvY2FsaXplKFwicGxheV9zaWRlYmFyX2xvZ3Nfbm9fbG9nc1wiLCBcIk5vIGxvZ3NcIilcbiAgICAgICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKFwiZW1wdHktcGx1Z2luLW1lc3NhZ2VcIilcbiAgICAgICAgbm9FcnJvcnNNZXNzYWdlLmFwcGVuZENoaWxkKG1lc3NhZ2UpXG5cbiAgICAgICAgZXJyb3JVTC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICAgICAgbG9nVG9vbHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICB9XG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cblxuZXhwb3J0IGNvbnN0IGNsZWFyTG9ncyA9ICgpID0+IHtcbiAgYWxsTG9ncyA9IFtdXG4gIGNvbnN0IGxvZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxuICBpZiAobG9ncykge1xuICAgIGxvZ3MudGV4dENvbnRlbnQgPSBcIlwiXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJ1bldpdGhDdXN0b21Mb2dzID0gKGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPiwgaTogRnVuY3Rpb24pID0+IHtcbiAgY29uc3Qgbm9Mb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbXB0eS1tZXNzYWdlLWNvbnRhaW5lclwiKVxuICBjb25zdCBsb2dDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZy1jb250YWluZXJcIikhXG4gIGNvbnN0IGxvZ1Rvb2xzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2ctdG9vbHNcIikhXG4gIGlmIChub0xvZ3MpIHtcbiAgICBub0xvZ3Muc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgbG9nQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcbiAgICBsb2dUb29sc0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCJcbiAgfVxuXG4gIHJld2lyZUxvZ2dpbmdUb0VsZW1lbnQoXG4gICAgKCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIikhLFxuICAgICgpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nLWNvbnRhaW5lclwiKSEsXG4gICAgY2xvc3VyZSxcbiAgICB0cnVlLFxuICAgIGlcbiAgKVxufVxuXG4vLyBUaGFua3MgU086IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIwMjU2NzYwL2phdmFzY3JpcHQtY29uc29sZS1sb2ctdG8taHRtbC8zNTQ0OTI1NiMzNTQ0OTI1NlxuXG5mdW5jdGlvbiByZXdpcmVMb2dnaW5nVG9FbGVtZW50KFxuICBlbGVMb2NhdG9yOiAoKSA9PiBFbGVtZW50LFxuICBlbGVPdmVyZmxvd0xvY2F0b3I6ICgpID0+IEVsZW1lbnQsXG4gIGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPixcbiAgYXV0b1Njcm9sbDogYm9vbGVhbixcbiAgaTogRnVuY3Rpb25cbikge1xuICBjb25zdCByYXdDb25zb2xlID0gY29uc29sZVxuXG4gIGNsb3N1cmUudGhlbihqcyA9PiB7XG4gICAgY29uc3QgcmVwbGFjZSA9IHt9IGFzIGFueVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCBcImxvZ1wiLCBcIkxPR1wiKVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCBcImRlYnVnXCIsIFwiREJHXCIpXG4gICAgYmluZExvZ2dpbmdGdW5jKHJlcGxhY2UsIHJhd0NvbnNvbGUsIFwid2FyblwiLCBcIldSTlwiKVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCBcImVycm9yXCIsIFwiRVJSXCIpXG4gICAgcmVwbGFjZVtcImNsZWFyXCJdID0gY2xlYXJMb2dzXG4gICAgY29uc3QgY29uc29sZSA9IE9iamVjdC5hc3NpZ24oe30sIHJhd0NvbnNvbGUsIHJlcGxhY2UpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhZmVKUyA9IHNhbml0aXplSlMoanMpXG4gICAgICBldmFsKHNhZmVKUylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihpKFwicGxheV9ydW5fanNfZmFpbFwiKSlcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG5cbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFN5bnRheEVycm9yICYmIC9cXGJleHBvcnRcXGIvdS50ZXN0KGVycm9yLm1lc3NhZ2UpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnVGlwOiBDaGFuZ2UgdGhlIE1vZHVsZSBzZXR0aW5nIHRvIFwiQ29tbW9uSlNcIiBpbiBUUyBDb25maWcgc2V0dGluZ3MgdG8gYWxsb3cgdG9wLWxldmVsIGV4cG9ydHMgdG8gd29yayBpbiB0aGUgUGxheWdyb3VuZCdcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBmdW5jdGlvbiBiaW5kTG9nZ2luZ0Z1bmMob2JqOiBhbnksIHJhdzogYW55LCBuYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcpIHtcbiAgICBvYmpbbmFtZV0gPSBmdW5jdGlvbiAoLi4ub2JqczogYW55W10pIHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IHByb2R1Y2VPdXRwdXQob2JqcylcbiAgICAgIGNvbnN0IGVsZUxvZyA9IGVsZUxvY2F0b3IoKVxuICAgICAgY29uc3QgcHJlZml4ID0gYFs8c3BhbiBjbGFzcz1cImxvZy0ke25hbWV9XCI+JHtpZH08L3NwYW4+XTogYFxuICAgICAgY29uc3QgZWxlQ29udGFpbmVyTG9nID0gZWxlT3ZlcmZsb3dMb2NhdG9yKClcbiAgICAgIGFsbExvZ3MucHVzaChgJHtwcmVmaXh9JHtvdXRwdXR9PGJyPmApXG4gICAgICBlbGVMb2cuaW5uZXJIVE1MID0gYWxsTG9ncy5qb2luKFwiPGhyIC8+XCIpXG4gICAgICBpZiAoYXV0b1Njcm9sbCAmJiBlbGVDb250YWluZXJMb2cpIHtcbiAgICAgICAgZWxlQ29udGFpbmVyTG9nLnNjcm9sbFRvcCA9IGVsZUNvbnRhaW5lckxvZy5zY3JvbGxIZWlnaHRcbiAgICAgIH1cbiAgICAgIHJhd1tuYW1lXSguLi5vYmpzKVxuICAgIH1cbiAgfVxuXG4gIC8vIElubGluZSBjb25zdGFudHMgd2hpY2ggYXJlIHN3aXRjaGVkIG91dCBhdCB0aGUgZW5kIG9mIHByb2Nlc3NpbmdcbiAgY29uc3QgcmVwbGFjZXJzID0ge1xuICAgIFwiPHNwYW4gY2xhc3M9J2xpdGVyYWwnPm51bGw8L3NwYW4+XCI6IFwiMTIzMTIzMjEzMTIzMTIzMTQyMzQzNDUzNDUzNFwiLFxuICAgIFwiPHNwYW4gY2xhc3M9J2xpdGVyYWwnPnVuZGVmaW5lZDwvc3Bhbj5cIjogXCI0NTM0NTM0NTM0NTYzNTY3NTY3NTY3XCIsXG4gICAgXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiOiBcIjc4NXk4MzQ1ODczNDg1NzYzODc0NTY4NzM0eTUzNTQzOFwiLFxuICB9XG5cbiAgY29uc3Qgb2JqZWN0VG9UZXh0ID0gKGFyZzogYW55KTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBpc09iaiA9IHR5cGVvZiBhcmcgPT09IFwib2JqZWN0XCJcbiAgICBsZXQgdGV4dFJlcCA9IFwiXCJcbiAgICBpZiAoYXJnICYmIGFyZy5zdGFjayAmJiBhcmcubWVzc2FnZSkge1xuICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciBlcnJcbiAgICAgIHRleHRSZXAgPSBodG1sRXNjYXBlKGFyZy5tZXNzYWdlKVxuICAgIH0gZWxzZSBpZiAoYXJnID09PSBudWxsKSB7XG4gICAgICB0ZXh0UmVwID0gcmVwbGFjZXJzW1wiPHNwYW4gY2xhc3M9J2xpdGVyYWwnPm51bGw8L3NwYW4+XCJdXG4gICAgfSBlbHNlIGlmIChhcmcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGV4dFJlcCA9IHJlcGxhY2Vyc1tcIjxzcGFuIGNsYXNzPSdsaXRlcmFsJz51bmRlZmluZWQ8L3NwYW4+XCJdXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN5bWJvbFwiKSB7XG4gICAgICB0ZXh0UmVwID0gYDxzcGFuIGNsYXNzPSdsaXRlcmFsJz4ke2h0bWxFc2NhcGUoU3RyaW5nKGFyZykpfTwvc3Bhbj5gXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgIHRleHRSZXAgPSBcIltcIiArIGFyZy5tYXAob2JqZWN0VG9UZXh0KS5qb2luKHJlcGxhY2Vyc1tcIjxzcGFuIGNsYXNzPSdjb21tYSc+LCA8L3NwYW4+XCJdKSArIFwiXVwiXG4gICAgfSBlbHNlIGlmIChhcmcgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgIGNvbnN0IHNldEl0ZXIgPSBbLi4uYXJnXVxuICAgICAgdGV4dFJlcCA9IGBTZXQgKCR7YXJnLnNpemV9KSB7YCArIHNldEl0ZXIubWFwKG9iamVjdFRvVGV4dCkuam9pbihyZXBsYWNlcnNbXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiXSkgKyBcIn1cIlxuICAgIH0gZWxzZSBpZiAoYXJnIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBjb25zdCBtYXBJdGVyID0gWy4uLmFyZy5lbnRyaWVzKCldXG4gICAgICB0ZXh0UmVwID1cbiAgICAgICAgYE1hcCAoJHthcmcuc2l6ZX0pIHtgICtcbiAgICAgICAgbWFwSXRlclxuICAgICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7b2JqZWN0VG9UZXh0KGspfSA9PiAke29iamVjdFRvVGV4dCh2KX1gKVxuICAgICAgICAgIC5qb2luKHJlcGxhY2Vyc1tcIjxzcGFuIGNsYXNzPSdjb21tYSc+LCA8L3NwYW4+XCJdKSArXG4gICAgICAgIFwifVwiXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0ZXh0UmVwID0gJ1wiJyArIGh0bWxFc2NhcGUoYXJnKSArICdcIidcbiAgICB9IGVsc2UgaWYgKGlzT2JqKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXJnLmNvbnN0cnVjdG9yICYmIGFyZy5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICAvLyBObyBvbmUgbmVlZHMgdG8ga25vdyBhbiBvYmogaXMgYW4gb2JqXG4gICAgICBjb25zdCBuYW1lV2l0aG91dE9iamVjdCA9IG5hbWUgJiYgbmFtZSA9PT0gXCJPYmplY3RcIiA/IFwiXCIgOiBodG1sRXNjYXBlKG5hbWUpXG4gICAgICBjb25zdCBwcmVmaXggPSBuYW1lV2l0aG91dE9iamVjdCA/IGAke25hbWVXaXRob3V0T2JqZWN0fTogYCA6IFwiXCJcblxuICAgICAgLy8gSlNPTi5zdHJpbmdpZnkgb21pdHMgYW55IGtleXMgd2l0aCBhIHZhbHVlIG9mIHVuZGVmaW5lZC4gVG8gZ2V0IGFyb3VuZCB0aGlzLCB3ZSByZXBsYWNlIHVuZGVmaW5lZCB3aXRoIHRoZSB0ZXh0IF9fdW5kZWZpbmVkX18gYW5kIHRoZW4gZG8gYSBnbG9iYWwgcmVwbGFjZSB1c2luZyByZWdleCBiYWNrIHRvIGtleXdvcmQgdW5kZWZpbmVkXG4gICAgICB0ZXh0UmVwID1cbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoYXJnLCAoXywgdmFsdWUpID0+ICh2YWx1ZSA9PT0gdW5kZWZpbmVkID8gXCJfX3VuZGVmaW5lZF9fXCIgOiB2YWx1ZSksIDIpLnJlcGxhY2UoXG4gICAgICAgICAgL1wiX191bmRlZmluZWRfX1wiL2csXG4gICAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgICApXG5cbiAgICAgIHRleHRSZXAgPSBodG1sRXNjYXBlKHRleHRSZXApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRSZXAgPSBodG1sRXNjYXBlKFN0cmluZyhhcmcpKVxuICAgIH1cbiAgICByZXR1cm4gdGV4dFJlcFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvZHVjZU91dHB1dChhcmdzOiBhbnlbXSkge1xuICAgIGxldCByZXN1bHQ6IHN0cmluZyA9IGFyZ3MucmVkdWNlKChvdXRwdXQ6IGFueSwgYXJnOiBhbnksIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB0ZXh0UmVwID0gb2JqZWN0VG9UZXh0KGFyZylcbiAgICAgIGNvbnN0IHNob3dDb21tYSA9IGluZGV4ICE9PSBhcmdzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGNvbW1hID0gc2hvd0NvbW1hID8gXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiIDogXCJcIlxuICAgICAgcmV0dXJuIG91dHB1dCArIHRleHRSZXAgKyBjb21tYSArIFwiIFwiXG4gICAgfSwgXCJcIilcblxuICAgIE9iamVjdC5rZXlzKHJlcGxhY2VycykuZm9yRWFjaChrID0+IHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKG5ldyBSZWdFeHAoKHJlcGxhY2VycyBhcyBhbnkpW2tdLCBcImdcIiksIGspXG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG4vLyBUaGUgcmVmbGVjdC1tZXRhZGF0YSBydW50aW1lIGlzIGF2YWlsYWJsZSwgc28gYWxsb3cgdGhhdCB0byBnbyB0aHJvdWdoXG5mdW5jdGlvbiBzYW5pdGl6ZUpTKGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY29kZS5yZXBsYWNlKGBpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCJgLCBcIlwiKS5yZXBsYWNlKGByZXF1aXJlKFwicmVmbGVjdC1tZXRhZGF0YVwiKWAsIFwiXCIpXG59XG5cbmZ1bmN0aW9uIGh0bWxFc2NhcGUoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcbn1cbiJdfQ==