const LowerBoundA = 0;
const LowerBoundB = 0;
const InvalidCoord = -1;
const __charcode_of_a = 'a'.charCodeAt(0);

const __sgf_parse_position_unsafe = (str) => {
    var a = str.charCodeAt(0) - __charcode_of_a + LowerBoundA;
    var b = str.charCodeAt(1) - __charcode_of_a + LowerBoundB;
    return [a,b];
};

const __sgf_inflate_position_range = (p1, p2) => {
    var v = [];

    var mina = Math.min(p1[0], p2[0]);
    var minb = Math.min(p1[1], p2[1]);
    var maxa = Math.max(p1[0], p2[0]);
    var maxb = Math.max(p1[1], p2[1]);

    for (var a = mina; a <= maxa; a++)
        for (var b = minb; b <= maxb; b++)
            v.push([a,b]);

    return v;
};

class SGFNode {
    constructor(parent) {
        this.position = [-1,-1];
        this.color = null;
        this.name = null;
        this.comment = null;
        this.markups = null;
        this.setupStones = null;
        this.annotations = null;
        this.children = [];
        this.parentNode = parent;
        if (this.parentNode)
            this.parentNode.children.push(this);
    }
}

class SGFGame {
    constructor() {
        this.info = {};
        this.rootNode = new SGFNode(null);
    }
}

class SGFSetupStone {
    constructor(color, positions) {
        this.color = color;
        this.positions = positions;
    }
}

class SGFSymbolMarkup {
    constructor(symbol, positions) {
        this.symbol = symbol;
        this.positions = positions;
    }
}

class SGFLineMarkup {
    constructor(from, to, hasArrow) {
        this.from = from;
        this.to = to;
        this.hasArrow = hasArrow;
    }
}

class SGFLabelMarkup {
    constructor(label, position) {
        this.label = label;
        this.position = position;
    }
}

const BOC = -1; // beginning of content
const TreeStart = 1; // start of a tree
const TreeEnd = 2; // end of a tree
const NewNode = 3; // new node
const TagNav = 4; // consuming property tag
const PropStart = 5; // start of property value
const PropNav = 6; // navigate property value content
const PropEnd = 7; // end of a property value

const __sgf_game_info_setter = (key) => { return (g, n, vl) => { g.info[key] = vl[0]; } };

const __sgf_node_setupstones_setter = (color) => { return (g, n, vl) => {
    var positions = [];
    for (var p of vl) {
        switch(p.length) {
            case 2:
                positions.push(__sgf_parse_position_unsafe(p));
                break;
            case 5:
                var raw = p.split(':');
                if (raw.length == 2) {
                    var v = __sgf_inflate_position_range(
                        __sgf_parse_position_unsafe(raw[0]),
                        __sgf_parse_position_unsafe(raw[1])
                    );
                    v.forEach(e => { positions.push(e); });
                }
        }
    }

    if (!n.setupStones)
        n.setupStones = [];

    n.setupStones.push(new SGFSetupStone(color, positions));
}; };

const __sgf_node_symbol_markup_setter = (symbol) => { return (g, n, vl) => {
    var positions = [];
    
    vl.forEach(raw => {
        positions.push(__sgf_parse_position_unsafe(raw));
    });

    if (positions.length > 0) {
        if (!n.markups)
            n.markups = [];
        
        n.markups.push(new SGFSymbolMarkup(symbol, positions));
    }
}; };

const __sgf_node_line_markup_setter = (hasArrow) => { return (g, n, vl) => {
    for(var raw of vl) {
        var b = raw.split(':');
        if (b.length != 2)
            continue;
        
        if (!n.markups)
            n.markups = [];
        
        n.markups.push(new SGFLineMarkup(
            __sgf_parse_position_unsafe(b[0]),
            __sgf_parse_position_unsafe(b[1]),
            hasArrow
        ));
    }
}; };

const __sgf_node_label_markup_setter = (g, n, vl) => {
    if (!n.markups)
        n.markups = [];
    
    var ls = [];
    var c = 0;
    for(var raw of vl) {
        var pair = raw.split(':');
        switch(pair.length) {
            case 1:
                var pos = __sgf_parse_position_unsafe(pair[0]);
                var label = String.fromCharCode(__charcode_of_a + c % 26);
                n.markups.push(new SGFLabelMarkup(label, pos));
                ++c;
                break;
            case 2:
                if (pair[0].length == 1)
                    n.markups.push(new SGFLabelMarkup(pair[0], __sgf_parse_position_unsafe(pair[1])));
                else
                    n.markups.push(new SGFLabelMarkup(pair[1], __sgf_parse_position_unsafe(pair[0])));
        }
    }
};

const __SETTERS = {
    // Game info properties
    'GN': __sgf_game_info_setter('GN'),
    'AP': __sgf_game_info_setter('AP'),
    'GC': __sgf_game_info_setter('GC'),
    'DT': __sgf_game_info_setter('DT'),
    'EV': __sgf_game_info_setter('EV'),
    'PC': __sgf_game_info_setter('PC'),
    'PB': __sgf_game_info_setter('PB'),
    'PW': __sgf_game_info_setter('PW'),
    'BC': __sgf_game_info_setter('BC'),
    'WC': __sgf_game_info_setter('WC'),
    'BR': __sgf_game_info_setter('BR'),
    'WR': __sgf_game_info_setter('WR'),
    'RE': __sgf_game_info_setter('RE'),
    'SO': __sgf_game_info_setter('SO'),
    'AN': __sgf_game_info_setter('AN'),
    'BT': __sgf_game_info_setter('BT'),
    'WT': __sgf_game_info_setter('WT'),
    'CP': __sgf_game_info_setter('CP'),
    'OP': __sgf_game_info_setter('OP'),
    'OT': __sgf_game_info_setter('OT'),
    'RO': __sgf_game_info_setter('RO'),
    'RU': __sgf_game_info_setter('RU'),
    'TM': __sgf_game_info_setter('TM'),
    'US': __sgf_game_info_setter('US'),
    'SZ': __sgf_game_info_setter('SZ'),
    'HA': __sgf_game_info_setter('HA'),
    'KM': __sgf_game_info_setter('KM'),

    // common node properties
    'C': (g, n, vl) => { n.comment = vl[0]; },
    'N': (g, n, vl) => { n.name = vl[0]; },
    'B': (g, n, vl) => { n.color = 'B'; n.position = __sgf_parse_position_unsafe(vl[0]); },
    'W': (g, n, vl) => { n.color = 'W'; n.position = __sgf_parse_position_unsafe(vl[0]); },

    // setup stones
    'AB': __sgf_node_setupstones_setter('B'),
    'AW': __sgf_node_setupstones_setter('W'),
    'AE': __sgf_node_setupstones_setter(null),

    // annotations
    'DM': (g, n, vl) => {}, // unimplemented
    'GB': (g, n, vl) => {}, // unimplemented
    'GW': (g, n, vl) => {}, // unimplemented
    'V': (g, n, vl) => {}, // unimplemented
    'UC': (g, n, vl) => {}, // unimplemented
    'HO': (g, n, vl) => {}, // unimplemented
    'BM': (g, n, vl) => {}, // unimplemented
    'DO': (g, n, vl) => {}, // unimplemented
    'IT': (g, n, vl) => {}, // unimplemented
    'TE': (g, n, vl) => {}, // unimplemented

    // markups
    'AR': __sgf_node_line_markup_setter(true),
    'LN': __sgf_node_line_markup_setter(false),
    'CR': __sgf_node_symbol_markup_setter('CR'),
    'MA': __sgf_node_symbol_markup_setter('MA'),
    'SQ': __sgf_node_symbol_markup_setter('SQ'),
    'TR': __sgf_node_symbol_markup_setter('TR'),
    'LB': __sgf_node_label_markup_setter,
    'RG': (g, n, vl) => {}, // unimplemented

    // DD - gray out
    // SL - selected points
    // ST - Defines how variations should be shown

    // extra
    'PL': (g, n, vl) => {}, // unimplemented
    'KO': (g, n, vl) => {}, // unimplemented
    'BL': (g, n, vl) => {}, // unimplemented
    'WL': (g, n, vl) => {}, // unimplemented
    'OB': (g, n, vl) => {}, // unimplemented
    'OW': (g, n, vl) => {} // unimplemented

    // FG
    // PM
    // VW
};

const __sgf_parse = (str) => {
    var _curNode = null;
    var _curGame = null;
    var _idx = 0;
    var _pos = BOC;
    var _boardSize = 19;
    var _stack = [];
    var _games = [];
    var _tagBuffer = '';
    var _valueBuffer = '';
    var _pvlist = [];

    const __set_property = () => {
        var tag = _tagBuffer.toUpperCase();
        var setter = __SETTERS[tag];

        if (setter) {
            setter(_curGame, _curNode, _pvlist);
        }
        else {
            console.log('unsupported tag: ', tag);
        }

        _tagBuffer = '';
        _pvlist = [];
    };

    while(_idx < str.length) {
        const c = str.charAt(_idx++);
        switch(c) {
            case '(': // start of a game tree
                if (_pos == PropEnd || _pos == TreeEnd || _pos == BOC) {
                    if (_pos == PropEnd || _pos == TreeEnd) {
                        // add last property
                        if (_pos == PropEnd)
                            __set_property();

                        // push last parent
                        _stack.push(_curNode);
                    }

                    _pos = TreeStart;
                }
                break;
            case ';': // start of a node
                if (_pos == TreeStart || _pos == PropEnd) {
                    // add last property
                    if (_pos == PropEnd)
                        __set_property();

                    _pos = NewNode;

                    // create a new node.
                    if (_curNode == null) {
                        var game = new SGFGame();
                        _games.push(game);
                        _curGame = game;
                        _curNode = _curGame.rootNode;
                    }
                    else {
                        var node = new SGFNode(_curNode);
                        _curNode = node;
                    }
                }
                break;
            case '[': // start of a property value
                switch (_pos) {
                    case TagNav:
                    case PropEnd:
                        _pos = PropStart;
                        break;
                }
                break;
            case ']': // end of a property value
                if (_pos == PropNav || _pos == PropStart) {
                    _pos = PropEnd;

                    // add property value to the pvlist
                    _pvlist.push(_valueBuffer);
                    _valueBuffer = '';
                }
                break;
            case ')': // end of a game tree
                if (_pos == TreeEnd || _pos == PropEnd) {
                    // add last property
                    if (_pos == PropEnd)
                        __set_property();

                    _pos = TreeEnd;

                    // pop last sub-tree root
                    _curNode = _stack.length != 0 ? _stack.pop() : null;
                }
                break;
            case '\\': // escape next char
                if (_pos == PropNav) {
                    if (_idx < str.length) {
                        // append property value char
                        _valueBuffer += str[_idx++];
                    }
                    else
                        throw new Exception("EOF");
                }
                break;
            default:
                if (_pos == PropEnd /* && c >= 'A' && c <= 'Z' */) {
                    // next property tag in the same node
                    _pos = TagNav;

                    // add last property
                    __set_property();

                    // add current char
                    _tagBuffer += c;
                }
                else if (_pos == NewNode) {
                    // first property tag in a node
                    _pos = TagNav;
                    _tagBuffer += c;
                }
                else if (_pos == TagNav) {
                    // append to the tag buffer
                    _tagBuffer += c;
                }
                else if (_pos == PropStart || _pos == PropNav) {
                    _pos = PropNav;

                    // append to the value buffer.
                    _valueBuffer += c;
                }
                break;
        }
    }

    return _games;
};

const parse = __sgf_parse;

module.exports = {
    parse,
    SGFNode,
    SGFGame,
    SGFSetupStone,
    SGFSymbolMarkup,
    SGFLineMarkup,
    SGFLabelMarkup,
    __sgf_parse_position_unsafe
};
