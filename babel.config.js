module.exports = {
    "presets": [        
        "@babel/typescript"
    ],
    "plugins": [
        "ts-nameof",
        "transform-typescript-metadata",
        ["@babel/proposal-decorators", { legacy: true }],
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        "@babel/proposal-optional-catch-binding",
        ["@babel/transform-modules-commonjs", { "noInterop": true }]
    ]
};