module.exports = {
    "env": {
        "node": true,
        "es6": true,
        "mocha": true
    },
    "globals": {
        "supertest": "readonly",
        "expect": "readonly",
        "next": "readonly"
    },
    "extends": "airbnb-base",
    "rules": {
        "linebreak-style": "off",
        "no-unused-expressions": "off",
        "implicit-arrow-linebreak": "off",
        "max-len": "off"
    },
    "overrides": [
        {
            "files": "*.spec.js",
            "rules": {
                "func-names": "off"
            }
        }
    ]
}