module.exports = function (api) {

    api.cache(true);
    // const isTest = api.env('test');

    const presets = [["@babel/preset-env", { "modules": false, targets: { node: 'current' }, "debug": false }]];
    const plugins = [["@babel/plugin-transform-modules-commonjs", { "spec": true }],
    ];

    return {
        presets,
        plugins
    };
}