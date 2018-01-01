/*
**  GemstoneJS -- Gemstone JavaScript Technology Stack
**  Copyright (c) 2016-2018 Gemstone Project <http://gemstonejs.com>
**  Licensed under Apache License 2.0 <https://spdx.org/licenses/Apache-2.0>
*/

/*  load external requirements  */
const path      = require("path")
const fs        = require("mz/fs")
const jsYAML    = require("js-yaml")

/*  exported API function  */
module.exports = async function (filenames, opts = {}, report = { sources: {}, findings: [] }) {
    /*  interate over all source files  */
    let passed = true
    if (typeof opts.progress === "function")
        opts.progress(0.0, "linting YAML: starting")
    for (let i = 0; i < filenames.length; i++) {
        /*  indicate progress  */
        if (typeof opts.progress === "function")
            opts.progress(i / filenames.length, `linting YAML: ${filenames[i]}`)

        /*  read source code  */
        let source = await fs.readFile(filenames[i], "utf8")

        /*  determine name  */
        let name = path.relative(process.cwd(), filenames[i])

        /*  lint the source code  */
        try {
            jsYAML.safeLoad(source, {
                filename: name,
                schema:   jsYAML.DEFAULT_SAFE_SCHEMA,
                onWarning: (warning) => {
                    report.findings.push({
                        ctx:      "YAML",
                        filename: name,
                        line:     warning.mark.line,
                        column:   warning.mark.column,
                        message:  warning.reason,
                        ruleProc: "jsYAML",
                        ruleId:   "*"
                    })
                    passed = false
                    report.sources[name] = source
                }
            })
        }
        catch (ex) {
            report.findings.push({
                ctx:      "YAML",
                filename: name,
                line:     ex.mark.line,
                column:   ex.mark.column,
                message:  ex.reason,
                ruleProc: "jsYAML",
                ruleId:   "*"
            })
            report.sources[name] = source
            passed = false
        }
    }
    if (typeof opts.progress === "function")
        opts.progress(1.0, "")
    return passed
}

