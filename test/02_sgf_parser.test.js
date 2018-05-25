const tap = require('tap');
const sgf = require('../index')

var simple = sgf.parse('(;FF[4]GN[Simple SGF\\]];B[aa];W[bb])');

tap.equal(simple.length, 1);
tap.equal(simple[0].info['GN'], 'Simple SGF]');
tap.equal(simple[0].rootNode.children[0].children[0].color, 'W');
tap.equal(simple[0].rootNode.children[0].children[0].position[1], 1);
