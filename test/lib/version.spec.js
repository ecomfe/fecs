var mock = require('mock-fs');
var version = require('../../lib/version');

describe('version of module', function () {

    afterEach(function () {
        mock.restore();
    });

    it('not specify', function () {
        var versions = version();

        expect(Object.keys(versions)).toEqual([]);
    });

    it('unknown module', function () {
        var versions = version(['foobar']);

        expect(Object.keys(versions)).toEqual(['foobar']);
        expect(versions.foobar).toBe('N/A');

    });

    it('detect eslint & babel-eslint', function () {
        var versions = version(['eslint', 'babel-eslint']);

        expect(Object.keys(versions)).toEqual(['eslint', 'babel-eslint']);

        var eslint = require('eslint/package.json');
        expect(versions.eslint).toBe(eslint.version);

        var babelESlint = require('babel-eslint/package.json');
        expect(versions['babel-eslint']).toBe(babelESlint.version);

    });
});
