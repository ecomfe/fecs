/**
 * @file Check statements of function.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

var path = require('path');
var mockFS = require('mock-fs');
var mockRequire = require('mock-require');

var eslint = require('eslint');
var eslintRules = eslint.linter.rules;

var ruleDir = path.join(__dirname, '../../../../lib/js/rules');
var rules = require(ruleDir);

var eslintPlugins;
var isNewer = process.versions.node.split('.')[0] >= 4;

describe('fecs rules for eslint', function () {

    describe('register', function () {
        beforeEach(function () {
            var files = {};

            files[ruleDir] = {
                'index.js': 'exports.foo = true;',
                'foo.js': 'exports.foo = true;',
                'foo-bar.js': 'exports.foo = true;',
                'fooBaz.js': 'exports.foo = true;',
                'foobar.json': '{"foo": true}'
            };
            mockFS(files);

            if (isNewer) {
                Object.keys(files[ruleDir]).forEach(function (file) {
                    mockRequire(path.join(ruleDir, file), {foo: true});
                });
            }

            eslintRules._rules = Object.create(null);
        });

        afterEach(function () {
            mockFS.restore();
            eslintRules._rules = Object.create(null);
            eslintRules.load();

            if (isNewer) {
                mockRequire.stopAll();
            }
        });

        it('only js file in dir', function () {
            rules.register(ruleDir);

            expect(eslintRules.get('fecs-foo')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-bar')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-baz')).toEqual({foo: true});

            // default to {create: context => ({Program() {...}})}
            expect(eslintRules.get('fecs-index')).not.toEqual({foo: true});
            expect(eslintRules.get('fecs-foobar')).not.toEqual({foo: true});
        });

        it('only js file in __dirname', function () {
            rules.register();

            expect(eslintRules.get('fecs-foo')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-bar')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-baz')).toEqual({foo: true});

            // default to {create: context => ({Program() {...}})}
            expect(eslintRules.get('fecs-index')).not.toEqual({foo: true});
            expect(eslintRules.get('fecs-foobar')).not.toEqual({foo: true});
        });

    });

    describe('registerPlugins', function () {
        beforeEach(function () {
            var files = {};
            var dir = path.join(__dirname, '../../../../node_modules');

            files[path.join(dir, 'eslint-plugin-foo')] = 'exports.rules = {}';
            files[path.join(dir, 'eslint-plugin-bar')] = 'exports.rules = {}';

            mockFS(files);
            mockRequire('eslint-plugin-foo', {rules: {}});
            mockRequire('eslint-plugin-bar', {rules: {}});

            eslintRules._rules = Object.create(null);
        });

        afterEach(function () {
            mockFS.restore();
            mockRequire.stopAll();
            eslintRules._rules = Object.create(null);
            eslintRules.load();
            eslintPlugins._plugins = Object.create(null);
        });

        it('param `plugins` as reset arguments', function () {
            rules.registerPlugins('eslint-plugin-foo', 'eslint-plugin-bar');
            eslintPlugins = rules.eslintPlugins();

            expect(eslintPlugins.get('eslint-plugin-foo')).toBeNull();
            expect(eslintPlugins.get('foo').rules).toEqual({});

            expect(eslintPlugins.get('eslint-plugin-bar')).toBeNull();
            expect(eslintPlugins.get('bar').rules).toEqual({});
        });

        it('param `plugins` as Array', function () {
            rules.registerPlugins(['eslint-plugin-foo', 'eslint-plugin-bar']);
            eslintPlugins = rules.eslintPlugins();

            expect(eslintPlugins.get('eslint-plugin-foo')).toBeNull();
            expect(eslintPlugins.get('foo').rules).toEqual({});

            expect(eslintPlugins.get('eslint-plugin-bar')).toBeNull();
            expect(eslintPlugins.get('bar').rules).toEqual({});
        });

    });
});
