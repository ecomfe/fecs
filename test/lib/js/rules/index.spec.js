/**
 * @file Check statements of function.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

var path = require('path');
var mock = require('mock-fs');

var eslintRules = require('eslint/lib/rules');
var eslintPlugins = require('eslint/lib/config/plugins');

var ruleDir = path.join(__dirname, '../../../../lib/js/rules');
var rules = require(ruleDir);

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
            mock(files);

            eslintRules.testClear();
        });

        afterEach(function () {
            mock.restore();
            eslintRules.testReset();
        });

        it('only js file in dir', function () {
            rules.register(ruleDir);

            expect(eslintRules.get('fecs-foo')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-bar')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-baz')).toEqual({foo: true});
            expect(eslintRules.get('fecs-index')).toBeUndefined();
            expect(eslintRules.get('fecs-foobar')).toBeUndefined();
        });

        it('only js file in __dirname', function () {
            rules.register();

            expect(eslintRules.get('fecs-foo')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-bar')).toEqual({foo: true});
            expect(eslintRules.get('fecs-foo-baz')).toEqual({foo: true});
            expect(eslintRules.get('fecs-index')).toBeUndefined();
            expect(eslintRules.get('fecs-foobar')).toBeUndefined();
        });

    });

    describe('registerPlugins', function () {
        beforeEach(function () {
            var files = {};
            var dir = path.join(__dirname, '../../../../node_modules');

            files[path.join(dir, 'eslint-plugin-foo')] = 'exports.rules = {}';
            files[path.join(dir, 'eslint-plugin-bar')] = 'exports.rules = {}';

            mock(files);

            eslintRules.testClear();
        });

        afterEach(function () {
            mock.restore();
            eslintRules.testReset();
            eslintPlugins.testReset();
        });

        it('param `plugins` as reset arguments', function () {
            rules.registerPlugins('eslint-plugin-foo', 'eslint-plugin-bar');

            expect(eslintPlugins.get('eslint-plugin-foo')).toBeNull();
            expect(eslintPlugins.get('foo').rules).toEqual({});

            expect(eslintPlugins.get('eslint-plugin-bar')).toBeNull();
            expect(eslintPlugins.get('bar').rules).toEqual({});
        });

        it('param `plugins` as Array', function () {
            rules.registerPlugins(['eslint-plugin-foo', 'eslint-plugin-bar']);

            expect(eslintPlugins.get('eslint-plugin-foo')).toBeNull();
            expect(eslintPlugins.get('foo').rules).toEqual({});

            expect(eslintPlugins.get('eslint-plugin-bar')).toBeNull();
            expect(eslintPlugins.get('bar').rules).toEqual({});
        });

    });
});
