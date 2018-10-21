(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Shadow = {})));
}(this, (function (exports) { 'use strict';

	/**
	 * 配置选项
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置选项
	 */
	function Options(options) {
	    options = options || {};

	    // 服务器配置
	    this.server = options.server === undefined ? location.origin : options.server; // 服务端地址

	    // 外观配置
	    this.theme = options.theme || 'assets/css/light.css'; // 皮肤

	    // 帮助器配置
	    this.showGrid = true; // 是否显示网格
	    this.showCameraHelper = true; // 是否显示相机帮助器
	    this.showPointLightHelper = false; // 是否显示点光源帮助器
	    this.showDirectionalLightHelper = true; // 是否显示平行光帮助器
	    this.showSpotLightHelper = true; // 是否显示聚光灯帮助器
	    this.showHemisphereLightHelper = true; // 是否显示半球光帮助器
	    this.showRectAreaLightHelper = true; // 是否显示矩形光帮助器
	    this.showSkeletonHelper = false; // 是否显示骨骼帮助器
	}

	var ID = -1;

	/**
	 * 所有控件基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Control(options) {
	    options = options || {};
	    this.parent = options.parent || document.body;
	    this.id = options.id || this.constructor.name + ID--;
	    this.scope = options.scope || 'global';

	    this.data = options.data || null; // 自定义数据，例如：{ name: '小米', age: 20 }

	    // 添加引用
	    UI.add(this.id, this, this.scope);
	}

	/**
	 * 定义控件属性
	 */
	Object.defineProperties(Control.prototype, {
	    /**
	     * 控件id（必须在options中设置，而且设置后无法改变）
	     */
	    id: {
	        get: function () {
	            return this._id;
	        },
	        set: function (id) {
	            if (this._id != null) {
	                console.warn(`Control: It is not allowed to assign new value to id.`);
	            }
	            this._id = id;
	        }
	    },

	    /**
	     * 控件id作用域（必须在options中设置，而且设置后无法改变）
	     */
	    scope: {
	        get: function () {
	            return this._scope;
	        },
	        set: function (scope) {
	            if (this._scope != null) {
	                console.warn(`Control: It is not allowed to assign new value to scope.`);
	            }
	            this._scope = scope;
	        }
	    }
	});

	/**
	 * 渲染控件
	 */
	Control.prototype.render = function () {

	};

	/**
	 * 清除该控件内部所有内容。
	 * 该控件仍然可以通过UI.get获取，可以通过render函数重写渲染该控件。
	 */
	Control.prototype.clear = function () {
	    // 移除所有子项引用
	    (function remove(items) {
	        if (items == null || items.length === 0) {
	            return;
	        }

	        items.forEach((n) => {
	            if (n.id) {
	                UI.remove(n.id, n.scope == null ? 'global' : n.scope);
	            }
	            remove(n.children);
	        });
	    })(this.children);

	    this.children.length = 0;

	    // 清空dom
	    if (this.dom) {
	        this.parent.removeChild(this.dom);
	        this.dom = null;
	    }

	    // TODO: 未清除绑定在dom上的事件
	};

	/**
	 * 彻底摧毁该控件，并删除在UI中的引用。
	 */
	Control.prototype.destroy = function () {
	    this.clear();
	    if (this.id) {
	        UI.remove(this.id, this.scope == null ? 'global' : this.scope);
	    }
	};

	/**
	 * 布尔值
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Boolean(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.text = options.text || '';
	    this.value = options.value || false;
	    this.cls = options.cls || 'Checkbox';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	}
	Boolean.prototype = Object.create(Control.prototype);
	Boolean.prototype.constructor = Boolean;

	Boolean.prototype.render = function () {
	    this.dom = document.createElement('span');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.input = document.createElement('input');
	    this.input.type = 'checkbox';
	    this.dom.appendChild(this.input);

	    this.span = document.createElement('span');
	    this.span.innerHTML = this.text;
	    this.dom.appendChild(this.span);

	    this.setValue(this.value);

	    if (this.onChange) {
	        this.input.addEventListener('change', this.onChange.bind(this), false);
	    }
	};

	Boolean.prototype.getValue = function () {
	    return this.input.checked;
	};

	Boolean.prototype.setValue = function (value) {
	    this.input.checked = value;
	};

	/**
	 * 换行符
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Break(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.cls = options.cls || null;
	}
	Break.prototype = Object.create(Control.prototype);
	Break.prototype.constructor = Break;

	Break.prototype.render = function () {
	    this.dom = document.createElement('br');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    this.parent.appendChild(this.dom);
	};

	/**
	 * 按钮
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Button(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.text = options.text || 'Button';
	    this.cls = options.cls || 'Button';
	    this.style = options.style || null;
	    this.title = options.title || null;

	    this.onClick = options.onClick || null;
	}
	Button.prototype = Object.create(Control.prototype);
	Button.prototype.constructor = Button;

	Button.prototype.render = function () {
	    this.dom = document.createElement('button');

	    this.dom.innerHTML = this.text;

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.title) {
	        this.dom.title = this.title;
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onClick) {
	        this.dom.addEventListener('click', this.onClick.bind(this), false);
	    }
	};

	Button.prototype.setText = function (text) {
	    this.text = text;
	    this.dom.innerHTML = this.text;
	};

	Button.prototype.select = function () {
	    this.dom.classList.add('selected');
	};

	Button.prototype.unselect = function () {
	    this.dom.classList.remove('selected');
	};

	/**
	 * 复选框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Checkbox(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value || false;
	    this.cls = options.cls || 'Checkbox';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	}
	Checkbox.prototype = Object.create(Control.prototype);
	Checkbox.prototype.constructor = Checkbox;

	Checkbox.prototype.render = function () {
	    this.dom = document.createElement('input');

	    this.dom.type = 'checkbox';

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }

	    this.setValue(this.value);
	};

	Checkbox.prototype.getValue = function () {
	    return this.dom.checked;
	};

	Checkbox.prototype.setValue = function (value) {
	    if (value !== undefined) {
	        this.dom.checked = value;
	    }

	    return this;
	};

	/**
	 * 关闭按钮
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function CloseButton(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'CloseButton';
	    this.style = options.style || null;

	    this.onClick = options.onClick || null;
	}

	CloseButton.prototype = Object.create(Control.prototype);
	CloseButton.prototype.constructor = CloseButton;

	CloseButton.prototype.render = function () {
	    this.dom = document.createElement('div');

	    this.dom.className = this.cls;

	    // TODO: 由于按钮默认白色，在白色背景上按钮将不可见！
	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onClick) {
	        this.dom.addEventListener('click', this.onClick.bind(this));
	    }

	    this.icon = document.createElement('i');
	    this.icon.className = 'iconfont icon-close';

	    this.dom.appendChild(this.icon);
	};

	/**
	 * 颜色选择器
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Color(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value || null;
	    this.cls = options.cls || 'Color';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	}
	Color.prototype = Object.create(Control.prototype);
	Color.prototype.constructor = Color;

	Color.prototype.render = function () {
	    this.dom = document.createElement('input');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    try {
	        this.dom.type = 'color';

	        if (this.value && this.value.toString().startsWith('#')) { // #ffffff
	            this.setValue(this.value);
	        } else if (this.value) { // 0xffffff
	            this.setHexValue(this.value);
	        } else {
	            this.dom.value = '#ffffff';
	        }
	    } catch (exception) {
	        console.warn(exception);
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }
	};

	Color.prototype.getValue = function () {
	    return this.dom.value;
	};

	Color.prototype.getHexValue = function () {
	    return parseInt(this.dom.value.substr(1), 16);
	};

	Color.prototype.setValue = function (value) {
	    this.dom.value = value;
	    return this;
	};

	Color.prototype.setHexValue = function (hex) {
	    this.dom.value = '#' + ('000000' + hex.toString(16)).slice(- 6);
	    return this;
	};

	/**
	 * 容器（外层无div等元素包裹）
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Container(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.children = options.children || [];
	}

	Container.prototype = Object.create(Control.prototype);
	Container.prototype.constructor = Container;

	Container.prototype.add = function (obj) {
	    if (!(obj instanceof Control)) {
	        throw 'Container: obj is not an instance of Control.';
	    }
	    this.children.push(obj);
	};

	Container.prototype.remove = function (obj) {
	    var index = this.children.indexOf(obj);
	    if (index > -1) {
	        this.children.splice(index, 1);
	    }
	};

	Container.prototype.render = function () {
	    var _this = this;
	    this.children.forEach(function (n) {
	        var obj = UI.create(n);
	        obj.parent = _this.parent;
	        obj.render();
	    });
	};

	/**
	 * Div元素
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Div(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.html = options.html || null;
	    this.cls = options.cls || null;
	    this.style = options.style || null;

	    this.onClick = options.onClick || null;
	}
	Div.prototype = Object.create(Container.prototype);
	Div.prototype.constructor = Div;

	Div.prototype.render = function () {
	    this.dom = document.createElement('div');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onClick) {
	        this.dom.onclick = this.onClick.bind(this);
	    }

	    var _this = this;

	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    } else {
	        this.children.forEach(function (n) {
	            var obj = UI.create(n);
	            obj.parent = _this.dom;
	            obj.render();
	        });
	    }
	};

	/**
	 * 水平线
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function HorizontalRule(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'HorizontalRule';
	}
	HorizontalRule.prototype = Object.create(Control.prototype);
	HorizontalRule.prototype.constructor = HorizontalRule;

	HorizontalRule.prototype.render = function () {
	    this.dom = document.createElement('hr');

	    this.dom.className = this.cls;

	    this.parent.appendChild(this.dom);
	};

	/**
	 * 原生html
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Html(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.html = options.html || null;
	}

	Html.prototype = Object.create(Control.prototype);
	Html.prototype.constructor = Html;

	/**
	 * 渲染控件
	 */
	Html.prototype.render = function () {
	    if (this.html) {
	        this.parent.innerHTML += this.html;
	    }
	};

	/**
	 * 图标按钮
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function IconButton(options) {
	    Button.call(this, options);

	    this.cls = options.cls || 'Button IconButton';
	    this.icon = options.icon || null; // 对应assets/css/icon/iconfont.css中的css
	    this.title = options.title || null;
	}

	IconButton.prototype = Object.create(Button.prototype);
	IconButton.prototype.constructor = IconButton;

	IconButton.prototype.render = function () {
	    Button.prototype.render.call(this);
	    if (this.icon) {
	        this.dom.innerHTML = `<i class="iconfont ${this.icon}"></i>`;
	    }
	};

	/**
	 * 输入框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Input(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value || '';
	    this.cls = options.cls || 'Input';
	    this.style = options.style || null;
	    this.disabled = options.disabled || false;
	    this.placeholder = options.placeholder || null;

	    this.onChange = options.onChange || null;
	    this.onInput = options.onInput || null;
	}
	Input.prototype = Object.create(Control.prototype);
	Input.prototype.constructor = Input;

	Input.prototype.render = function () {
	    this.dom = document.createElement('input');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.disabled) {
	        this.dom.disabled = 'disabled';
	    }

	    if (this.placeholder) {
	        this.dom.placeholder = this.placeholder;
	    }

	    this.dom.addEventListener('keydown', function (event) {
	        event.stopPropagation();
	    }, false);

	    this.parent.appendChild(this.dom);

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }

	    if (this.onInput) {
	        this.dom.addEventListener('input', this.onInput.bind(this));
	    }

	    this.setValue(this.value);
	};

	Input.prototype.getValue = function () {
	    return this.dom.value;
	};

	Input.prototype.setValue = function (value) {
	    this.dom.value = value;
	    return this;
	};

	/**
	 * 整数
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Integer(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value || 0;
	    this.min = options.range ? options.range[0] : -Infinity;
	    this.max = options.range ? options.range[1] : Infinity;
	    this.step = options.step || 1; // TODO: step无效
	    this.cls = options.cls || 'Number';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	}
	Integer.prototype = Object.create(Control.prototype);
	Integer.prototype.constructor = Integer;

	Integer.prototype.render = function () {
	    this.dom = document.createElement('input');

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.dom.className = this.cls;
	    this.dom.value = '0';

	    this.dom.addEventListener('keydown', function (event) {
	        event.stopPropagation();
	    }, false);

	    this.setValue(this.value);

	    var changeEvent = document.createEvent('HTMLEvents');
	    changeEvent.initEvent('change', true, true);

	    var distance = 0;
	    var onMouseDownValue = 0;

	    var pointer = [0, 0];
	    var prevPointer = [0, 0];

	    var _this = this;

	    function onMouseDown(event) {
	        event.preventDefault();

	        distance = 0;
	        onMouseDownValue = _this.value;
	        prevPointer = [event.clientX, event.clientY];

	        document.addEventListener('mousemove', onMouseMove, false);
	        document.addEventListener('mouseup', onMouseUp, false);
	    }

	    function onMouseMove(event) {
	        var currentValue = _this.value;
	        pointer = [event.clientX, event.clientY];
	        distance += (pointer[0] - prevPointer[0]) - (pointer[1] - prevPointer[1]);

	        var value = onMouseDownValue + (distance / (event.shiftKey ? 5 : 50)) * _this.step;
	        value = Math.min(_this.max, Math.max(_this.min, value)) | 0;

	        if (currentValue !== value) {
	            _this.setValue(value);
	            _this.dom.dispatchEvent(changeEvent);
	        }
	        prevPointer = [event.clientX, event.clientY];
	    }

	    function onMouseUp(event) {
	        document.removeEventListener('mousemove', onMouseMove, false);
	        document.removeEventListener('mouseup', onMouseUp, false);

	        if (Math.abs(distance) < 2) {
	            _this.dom.focus();
	            _this.dom.select();
	        }
	    }

	    function onChange(event) {
	        _this.setValue(_this.dom.value);
	        if (_this.onChange) {
	            _this.onChange.call(_this, _this.dom.value);
	        }
	    }

	    function onFocus(event) {
	        _this.dom.style.backgroundColor = '';
	        _this.dom.style.cursor = '';
	    }

	    function onBlur(event) {
	        _this.dom.style.backgroundColor = 'transparent';
	        _this.dom.style.cursor = 'col-resize';
	    }

	    onBlur();

	    this.dom.addEventListener('mousedown', onMouseDown, false);
	    this.dom.addEventListener('change', onChange, false);
	    this.dom.addEventListener('focus', onFocus, false);
	    this.dom.addEventListener('blur', onBlur, false);

	    this.parent.appendChild(this.dom);
	};

	Integer.prototype.getValue = function () {
	    return this.value;
	};

	Integer.prototype.setValue = function (value) {
	    if (value !== undefined) {
	        value = parseInt(value);

	        this.value = value;
	        this.dom.value = value;
	    }

	    return this;
	};

	Integer.prototype.setStep = function (step) {
	    this.step = parseInt(step);
	    return this;
	};

	Integer.prototype.setRange = function (min, max) {
	    this.min = min;
	    this.max = max;

	    return this;
	};

	/**
	 * 标签控件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Label(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.text = options.text || '';
	    this.cls = options.cls || null;
	    this.style = options.style || null;
	}
	Label.prototype = Object.create(Control.prototype);
	Label.prototype.constructor = Label;

	Label.prototype.render = function () {
	    this.dom = document.createElement('label');

	    if (this.text) {
	        this.setValue(this.text);
	    }

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);
	};

	Label.prototype.getValue = function () {
	    return this.dom.textContent;
	};

	Label.prototype.setValue = function (value) {
	    if (value !== undefined) {
	        this.dom.textContent = value;
	    }
	    return this;
	};

	/**
	 * 模态框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Modal(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'Modal';
	    this.style = options.style || null;
	    this.width = options.width || '500px';
	    this.height = options.height || '300px';
	    this.shade = options.shade === false ? false : true;
	    this.shadeClose = options.shadeClose || false;
	}
	Modal.prototype = Object.create(Container.prototype);
	Modal.prototype.constructor = Modal;

	Modal.prototype.render = function () {
	    this.dom = document.createElement('div');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.shade === false) {
	        this.dom.classList.add('NoShade');
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.container = document.createElement('div');

	    this.container.className = 'Container';

	    this.container.style.width = this.width;
	    this.container.style.height = this.height;

	    this.dom.appendChild(this.container);

	    this.container.addEventListener('mousedown', function (event) {
	        event.stopPropagation();
	    });

	    if (this.shadeClose) {
	        this.dom.addEventListener('mousedown', this.hide.bind(this));
	    }

	    var _this = this;

	    this.children.forEach(function (n) {
	        var obj = UI.create(n);
	        obj.parent = _this.container;
	        obj.render();
	    });
	};

	Modal.prototype.show = function () {
	    if (this.dom) {
	        this.dom.style.display = 'flex';
	    }
	    return this;
	};

	Modal.prototype.hide = function () {
	    if (this.dom) {
	        this.dom.style.display = 'none';
	    }
	    return this;
	};

	/**
	 * 数字
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Number$1(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value === undefined ? 0 : options.value;

	    this.min = options.range ? options.range[0] : -Infinity;
	    this.max = options.range ? options.range[1] : Infinity;

	    this.precision = options.precision === undefined ? 2 : options.precision; // 显示时保留几位小数
	    this.step = options.step === undefined ? 0.1 : options.step; // 步长
	    this.unit = options.unit === undefined ? '' : options.unit; // 单位（显示时跟在数字后面）
	    this.cls = options.cls || 'Number';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	}
	Number$1.prototype = Object.create(Control.prototype);
	Number$1.prototype.constructor = Number$1;

	Number$1.prototype.render = function () {
	    this.dom = document.createElement('input');

	    this.dom.className = this.cls;

	    this.dom.value = '0.00';

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    var _this = this;

	    // 回车事件
	    this.dom.addEventListener('keydown', function (event) {
	        event.stopPropagation();

	        if (event.keyCode === 13) {
	            _this.dom.blur();
	        }
	    }, false);

	    this.setValue(this.value);

	    var changeEvent = document.createEvent('HTMLEvents');
	    changeEvent.initEvent('change', true, true);

	    var distance = 0;
	    var onMouseDownValue = 0;

	    var pointer = [0, 0];
	    var prevPointer = [0, 0];

	    function onMouseDown(event) {
	        event.preventDefault();
	        distance = 0;
	        onMouseDownValue = _this.value;
	        prevPointer = [event.clientX, event.clientY];
	        document.addEventListener('mousemove', onMouseMove, false);
	        document.addEventListener('mouseup', onMouseUp, false);
	    }

	    function onMouseMove(event) {
	        var currentValue = _this.value;
	        pointer = [event.clientX, event.clientY];
	        distance += (pointer[0] - prevPointer[0]) - (pointer[1] - prevPointer[1]);
	        var value = onMouseDownValue + (distance / (event.shiftKey ? 5 : 50)) * _this.step;
	        value = Math.min(_this.max, Math.max(_this.min, value));

	        if (currentValue !== value) {
	            _this.setValue(value);
	            _this.dom.dispatchEvent(changeEvent);
	        }

	        prevPointer = [event.clientX, event.clientY];
	    }

	    function onMouseUp(event) {
	        document.removeEventListener('mousemove', onMouseMove, false);
	        document.removeEventListener('mouseup', onMouseUp, false);

	        if (Math.abs(distance) < 2) {
	            _this.dom.focus();
	            _this.dom.select();
	        }
	    }

	    function onChange(event) {
	        _this.setValue(_this.dom.value);

	        if (_this.onChange) {
	            _this.onChange.call(_this, _this.dom.value);
	        }
	    }

	    function onFocus(event) {
	        _this.dom.style.backgroundColor = '';
	        _this.dom.style.cursor = '';
	    }

	    function onBlur(event) {
	        _this.dom.style.backgroundColor = 'transparent';
	        _this.dom.style.cursor = 'col-resize';
	    }

	    onBlur();

	    this.dom.addEventListener('mousedown', onMouseDown, false);
	    this.dom.addEventListener('change', onChange, false);
	    this.dom.addEventListener('focus', onFocus, false);
	    this.dom.addEventListener('blur', onBlur, false);

	    this.parent.appendChild(this.dom);
	};

	Number$1.prototype.getValue = function () {
	    return this.value;
	};

	Number$1.prototype.setValue = function (value) {
	    value = parseFloat(value);

	    if (value < this.min) {
	        value = this.min;
	    }

	    if (value > this.max) {
	        value = this.max;
	    }

	    this.value = value;
	    this.dom.value = value.toFixed(this.precision) + this.unit;
	};

	/**
	 * 命令基类
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param editorRef pointer to main editor object used to initialize each command object with a reference to the editor
	 * @constructor
	 */
	function Command(editorRef) {
	    this.id = -1;
	    this.inMemory = false;
	    this.updatable = false;
	    this.type = '';
	    this.name = '';

	    if (editorRef !== undefined) {
	        Command.editor = editorRef;
	    }
	    this.editor = Command.editor;
	}
	Command.prototype.toJSON = function () {
	    var output = {};
	    output.type = this.type;
	    output.id = this.id;
	    output.name = this.name;
	    return output;
	};

	Command.prototype.fromJSON = function (json) {
	    this.inMemory = true;
	    this.type = json.type;
	    this.id = json.id;
	    this.name = json.name;
	};

	/**
	 * 移动物体命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newParent THREE.Object3D
	 * @param newBefore THREE.Object3D
	 * @constructor
	 */
	function MoveObjectCommand(object, newParent, newBefore) {
		Command.call(this);

		this.type = 'MoveObjectCommand';
		this.name = '移动物体';

		this.object = object;
		this.oldParent = (object !== undefined) ? object.parent : undefined;
		this.oldIndex = (this.oldParent !== undefined) ? this.oldParent.children.indexOf(this.object) : undefined;
		this.newParent = newParent;

		if (newBefore !== undefined) {
			this.newIndex = (newParent !== undefined) ? newParent.children.indexOf(newBefore) : undefined;
		} else {
			this.newIndex = (newParent !== undefined) ? newParent.children.length : undefined;
		}

		if (this.oldParent === this.newParent && this.newIndex > this.oldIndex) {
			this.newIndex--;
		}

		this.newBefore = newBefore;
	}
	MoveObjectCommand.prototype = Object.create(Command.prototype);

	Object.assign(MoveObjectCommand.prototype, {
		constructor: MoveObjectCommand,

		execute: function () {
			this.oldParent.remove(this.object);

			var children = this.newParent.children;
			children.splice(this.newIndex, 0, this.object);
			this.object.parent = this.newParent;

			this.editor.app.call('sceneGraphChanged', this);
		},

		undo: function () {
			this.newParent.remove(this.object);

			var children = this.oldParent.children;
			children.splice(this.oldIndex, 0, this.object);
			this.object.parent = this.oldParent;

			this.editor.app.call('sceneGraphChanged', this);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.newParentUuid = this.newParent.uuid;
			output.oldParentUuid = this.oldParent.uuid;
			output.newIndex = this.newIndex;
			output.oldIndex = this.oldIndex;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.oldParent = this.editor.objectByUuid(json.oldParentUuid);
			if (this.oldParent === undefined) {

				this.oldParent = this.editor.scene;

			}
			this.newParent = this.editor.objectByUuid(json.newParentUuid);
			if (this.newParent === undefined) {

				this.newParent = this.editor.scene;

			}
			this.newIndex = json.newIndex;
			this.oldIndex = json.oldIndex;
		}
	});

	/**
	 * 大纲控件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Outliner(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.onChange = options.onChange || null;
	    this.onDblClick = options.onDblClick || null;
	}

	Outliner.prototype = Object.create(Control.prototype);
	Outliner.prototype.constructor = Outliner;

	Outliner.prototype.render = function () {
	    this.dom = document.createElement('div');

	    this.dom.className = 'Outliner';
	    this.dom.tabIndex = 0;	// keyup event is ignored without setting tabIndex

	    // Prevent native scroll behavior
	    this.dom.addEventListener('keydown', function (event) {
	        switch (event.keyCode) {
	            case 38: // up
	            case 40: // down
	                event.preventDefault();
	                event.stopPropagation();
	                break;
	        }

	    }, false);

	    var _this = this;

	    // Keybindings to support arrow navigation
	    this.dom.addEventListener('keyup', function (event) {
	        switch (event.keyCode) {
	            case 38: // up
	                _this.selectIndex(scope.selectedIndex - 1);
	                break;
	            case 40: // down
	                _this.selectIndex(scope.selectedIndex + 1);
	                break;
	        }

	    }, false);

	    this.parent.appendChild(this.dom);

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }

	    if (this.onDblClick) {
	        this.dom.addEventListener('dblclick', this.onDblClick.bind(this));
	    }

	    this.options = [];
	    this.selectedIndex = - 1;
	    this.selectedValue = null;
	};

	Outliner.prototype.selectIndex = function (index) {
	    if (index >= 0 && index < this.options.length) {
	        this.setValue(this.options[index].value);

	        var changeEvent = document.createEvent('HTMLEvents');
	        changeEvent.initEvent('change', true, true);
	        this.dom.dispatchEvent(changeEvent);
	    }
	};

	Outliner.prototype.setOptions = function (options) {
	    var _this = this;

	    if (_this.editor === undefined) {
	        throw 'Outliner: editor is undefined.';
	    }

	    _this.scene = _this.editor.scene;

	    while (this.dom.children.length > 0) {
	        this.dom.removeChild(this.dom.firstChild);
	    }

	    function onClick() {
	        _this.setValue(this.value);

	        var changeEvent = document.createEvent('HTMLEvents');
	        changeEvent.initEvent('change', true, true);
	        _this.dom.dispatchEvent(changeEvent);
	    }

	    // Drag
	    var currentDrag;

	    function onDrag(event) {
	        currentDrag = this;
	    }

	    function onDragStart(event) {
	        event.dataTransfer.setData('text', 'foo');
	    }

	    function onDragOver(event) {
	        if (this === currentDrag) {
	            return;
	        }

	        var area = event.offsetY / this.clientHeight;

	        if (area < 0.25) {
	            this.className = 'option dragTop';
	        } else if (area > 0.75) {
	            this.className = 'option dragBottom';
	        } else {
	            this.className = 'option drag';
	        }
	    }

	    function onDragLeave() {
	        if (this === currentDrag) {
	            return;
	        }

	        this.className = 'option';
	    }

	    function onDrop(event) {
	        if (this === currentDrag) {
	            return;
	        }

	        this.className = 'option';

	        var scene = _this.scene;
	        var object = scene.getObjectById(currentDrag.value);

	        var area = event.offsetY / this.clientHeight;

	        if (area < 0.25) {
	            var nextObject = scene.getObjectById(this.value);
	            moveObject(object, nextObject.parent, nextObject);
	        } else if (area > 0.75) {
	            var nextObject = scene.getObjectById(this.nextSibling.value);
	            moveObject(object, nextObject.parent, nextObject);
	        } else {
	            var parentObject = scene.getObjectById(this.value);
	            moveObject(object, parentObject);
	        }
	    }

	    function moveObject(object, newParent, nextObject) {
	        if (nextObject === null) nextObject = undefined;

	        var newParentIsChild = false;

	        object.traverse(function (child) {
	            if (child === newParent) newParentIsChild = true;
	        });

	        if (newParentIsChild) return;

	        _this.editor.execute(new MoveObjectCommand(object, newParent, nextObject));

	        var changeEvent = document.createEvent('HTMLEvents');
	        changeEvent.initEvent('change', true, true);
	        _this.dom.dispatchEvent(changeEvent);
	    }

	    //
	    _this.options = [];

	    for (var i = 0; i < options.length; i++) {
	        var div = options[i];
	        div.className = 'option';
	        _this.dom.appendChild(div);

	        _this.options.push(div);

	        div.addEventListener('click', onClick, false);

	        if (div.draggable === true) {
	            div.addEventListener('drag', onDrag, false);
	            div.addEventListener('dragstart', onDragStart, false); // Firefox needs this

	            div.addEventListener('dragover', onDragOver, false);
	            div.addEventListener('dragleave', onDragLeave, false);
	            div.addEventListener('drop', onDrop, false);
	        }
	    }

	    return _this;
	};

	Outliner.prototype.getValue = function () {
	    return this.selectedValue;
	};

	Outliner.prototype.setValue = function (value) {
	    for (var i = 0; i < this.options.length; i++) {
	        var element = this.options[i];

	        if (element.value === value) {
	            element.classList.add('active');

	            // scroll into view
	            var y = element.offsetTop - this.dom.offsetTop;
	            var bottomY = y + element.offsetHeight;
	            var minScroll = bottomY - this.dom.offsetHeight;

	            if (this.dom.scrollTop > y) {
	                this.dom.scrollTop = y;
	            } else if (this.dom.scrollTop < minScroll) {
	                this.dom.scrollTop = minScroll;
	            }

	            this.selectedIndex = i;
	        } else {
	            element.classList.remove('active');
	        }
	    }

	    this.selectedValue = value;

	    return this;
	};

	/**
	 * 行控件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Row(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'Row';
	    this.style = options.style || null;
	}
	Row.prototype = Object.create(Container.prototype);
	Row.prototype.constructor = Row;

	Row.prototype.render = function () {
	    this.dom = document.createElement('div');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    var _this = this;

	    this.children.forEach(function (n) {
	        var obj = UI.create(n);
	        obj.parent = _this.dom;
	        obj.render();
	    });
	};

	/**
	 * 选择列表
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Select(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.options = options.options || [];
	    this.value = options.value || '';
	    this.cls = options.cls || 'Select';
	    this.style = options.style || null;
	    this.multiple = options.multiple || false;
	    this.disabled = options.disabled || false;

	    this.onChange = options.onChange || null;
	}
	Select.prototype = Object.create(Control.prototype);
	Select.prototype.constructor = Select;

	Select.prototype.render = function () {
	    this.dom = document.createElement('select');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.multiple) {
	        this.dom.multiple = this.multiple;
	    }

	    if (this.disabled) {
	        this.dom.disabled = 'disabled';
	    }

	    if (this.options) {
	        Object.keys(this.options).forEach(n => {
	            var option = document.createElement('option');
	            option.value = n;
	            option.innerHTML = this.options[n];

	            if (this.value === n) {
	                option.selected = 'selected';
	            }

	            this.dom.appendChild(option);
	        });
	    }

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }

	    this.parent.appendChild(this.dom);
	};

	Select.prototype.setMultiple = function (boolean) {
	    this.dom.multiple = boolean;
	    return this;
	};

	Select.prototype.setOptions = function (options) {
	    var selected = this.dom.value;
	    while (this.dom.children.length > 0) {
	        this.dom.removeChild(this.dom.firstChild);
	    }

	    for (var key in options) {
	        var option = document.createElement('option');
	        option.value = key;
	        option.innerHTML = options[key];
	        this.dom.appendChild(option);
	    }

	    this.dom.value = selected;

	    return this;

	};

	Select.prototype.getValue = function () {
	    return this.dom.value;
	};

	Select.prototype.setValue = function (value) {
	    value = String(value);

	    if (this.dom.value !== value) {
	        this.dom.value = value;
	    }

	    return this;
	};

	/**
	 * 文本块
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Span(options) {
	    Container.call(this, options);
	}
	Span.prototype = Object.create(Container.prototype);
	Span.prototype.constructor = Span;

	Span.prototype.render = function () {
	    this.dom = document.createElement('span');
	    this.parent.appendChild(this.dom);

	    var _this = this;
	    this.children.forEach(function (n) {
	        var obj = UI.create(n);
	        obj.parent = _this.dom;
	        obj.render();
	    });
	};

	/**
	 * 文本框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Text(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.text = options.text || '';
	    this.cls = options.cls || 'Text';
	    this.style = options.style || null;

	    this.onClick = options.onClick || null;
	}
	Text.prototype = Object.create(Control.prototype);
	Text.prototype.constructor = Text;

	Text.prototype.render = function () {
	    this.dom = document.createElement('span');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.setValue(this.text);

	    if (this.onClick) {
	        this.dom.addEventListener('click', this.onClick.bind(this));
	    }

	    this.parent.appendChild(this.dom);
	};

	Text.prototype.getValue = function () {
	    return this.dom.textContent;
	};

	Text.prototype.setValue = function (value) {
	    if (value !== undefined) {
	        this.dom.textContent = value;
	    }
	    return this;
	};

	/**
	 * 文本域
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextArea(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.value = options.value || '';
	    this.cls = options.cls || 'TextArea';
	    this.style = options.style || null;

	    this.onChange = options.onChange || null;
	    this.onKeyUp = options.onKeyUp || null;
	}
	TextArea.prototype = Object.create(Control.prototype);
	TextArea.prototype.constructor = TextArea;

	TextArea.prototype.render = function () {
	    this.dom = document.createElement('textarea');

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.dom.spellcheck = false;

	    var _this = this;

	    this.dom.addEventListener('keydown', function (event) {
	        event.stopPropagation();

	        if (event.keyCode === 9) {
	            event.preventDefault();

	            var cursor = _this.dom.selectionStart;
	            _this.dom.value = _this.dom.value.substring(0, cursor) + '\t' + _this.dom.value.substring(cursor);
	            _this.dom.selectionStart = cursor + 1;
	            _this.dom.selectionEnd = _this.dom.selectionStart;
	        }

	    }, false);

	    this.parent.appendChild(this.dom);

	    if (this.onChange) {
	        this.dom.addEventListener('change', this.onChange.bind(this));
	    }

	    if (this.onKeyUp) {
	        this.dom.addEventListener('keyup', this.onKeyUp.bind(this));
	    }

	    this.setValue(this.value);
	};

	TextArea.prototype.getValue = function () {
	    return this.dom.value;
	};

	TextArea.prototype.setValue = function (value) {
	    this.dom.value = value;
	    return this;
	};

	/**
	 * 纹理
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Texture(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.mapping = options.mapping || THREE.UVMapping;

	    this.onChange = options.onChange || null;
	}

	Texture.prototype = Object.create(Control.prototype);
	Texture.prototype.constructor = Texture;

	Texture.prototype.render = function () {
	    this.dom = document.createElement('div');

	    this.dom.className = 'Texture';

	    this.form = document.createElement('form');

	    this.input = document.createElement('input');
	    this.input.type = 'file';

	    var _this = this;

	    this.input.addEventListener('change', function (event) {
	        _this.loadFile(event.target.files[0]);
	    });

	    this.form.appendChild(this.input);

	    this.canvas = document.createElement('canvas');
	    this.canvas.width = 32;
	    this.canvas.height = 16;

	    this.canvas.addEventListener('click', function (event) {
	        _this.input.click();
	    }, false);

	    this.canvas.addEventListener('drop', function (event) {
	        event.preventDefault();
	        event.stopPropagation();
	        _this.loadFile(event.dataTransfer.files[0]);
	    }, false);

	    this.dom.appendChild(this.canvas);

	    this.name = document.createElement('input');
	    this.name.disabled = true;
	    this.dom.appendChild(this.name);

	    this.parent.appendChild(this.dom);

	    this.texture = null;
	};

	Texture.prototype.getValue = function () {
	    return this.texture;
	};

	Texture.prototype.setValue = function (texture) {
	    var canvas = this.dom.children[0];
	    var name = this.dom.children[1];
	    var context = canvas.getContext('2d');

	    if (texture !== null) {
	        var image = texture.image;

	        if (image !== undefined && image.width > 0) {
	            if (texture.sourceFile) {
	                name.value = texture.sourceFile;
	            } else {
	                name.value = '';
	            }

	            var scale = canvas.width / image.width;
	            context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
	        } else {
	            name.value = (texture.sourceFile == null ? '' : texture.sourceFile) + '错误';
	            context.clearRect(0, 0, canvas.width, canvas.height);
	        }

	    } else {
	        name.value = '';

	        if (context !== null) {
	            // Seems like context can be null if the canvas is not visible
	            context.clearRect(0, 0, canvas.width, canvas.height);
	        }
	    }

	    this.texture = texture;
	};

	Texture.prototype.loadFile = function (file) {
	    var _this = this;

	    if (file.type.match('image.*')) {
	        var reader = new FileReader();

	        if (file.type === 'image/targa') {
	            reader.addEventListener('load', function (event) {
	                var canvas = new THREE.TGALoader().parse(event.target.result);
	                var texture = new THREE.CanvasTexture(canvas, _this.mapping);

	                texture.sourceFile = file.name;

	                _this.setValue(texture);

	                if (_this.onChange) {
	                    _this.onChange();
	                }
	            }, false);

	            reader.readAsArrayBuffer(file);
	        } else {
	            reader.addEventListener('load', function (event) {
	                var image = document.createElement('img');

	                image.addEventListener('load', function (event) {
	                    var texture = new THREE.Texture(this, _this.mapping);
	                    texture.sourceFile = file.name;
	                    texture.format = file.type === 'image/jpeg' ? THREE.RGBFormat : THREE.RGBAFormat;
	                    texture.needsUpdate = true;

	                    _this.setValue(texture);

	                    if (_this.onChange) {
	                        _this.onChange();
	                    }
	                }, false);

	                image.src = event.target.result;
	            }, false);

	            reader.readAsDataURL(file);
	        }
	    }

	    this.form.reset();
	};

	/**
	 * 窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Window(options) {
	    Modal.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'Modal Window';
	    this.style = options.style || null;
	    this.bodyStyle = options.bodyStyle || null;
	    this.title = options.title || '';
	    this.buttons = options.buttons || [];
	}
	Window.prototype = Object.create(Modal.prototype);
	Window.prototype.constructor = Window;

	Window.prototype.render = function () {
	    this.content = this.children; // 内容
	    this.children = []; // 标题栏、内容区域、按钮工具栏

	    // 标题
	    this.caption = UI.create({
	        xtype: 'container',
	        children: [{
	            xtype: 'div',
	            cls: 'caption',
	            html: this.title
	        }]
	    });

	    // 关闭按钮
	    this.closeBtn = UI.create({
	        xtype: 'closebutton',
	        onClick: () => {
	            this.hide();
	        }
	    });

	    // 标题栏
	    this.header = UI.create({
	        xtype: 'div',
	        cls: 'header',
	        children: [
	            this.caption,
	            this.closeBtn
	        ]
	    });
	    this.children.push(this.header);

	    // 内容区域
	    this.body = UI.create({
	        xtype: 'div',
	        cls: 'body',
	        style: this.bodyStyle,
	        children: this.content
	    });
	    this.children.push(this.body);

	    // 按钮区域
	    this.footer = UI.create({
	        xtype: 'div',
	        cls: 'footer',
	        children: this.buttons
	    });
	    this.children.push(this.footer);

	    Modal.prototype.render.call(this);

	    // 拖动标题栏
	    var isDown = false;
	    var offsetX = 0;
	    var offsetY = 0;

	    var _this = this;

	    function mouseDown(event) {
	        isDown = true;
	        var left = _this.container.style.left === '' ? 0 : parseInt(_this.container.style.left.replace('px', ''));
	        var top = _this.container.style.top === '' ? 0 : parseInt(_this.container.style.top.replace('px', ''));
	        offsetX = event.clientX - left;
	        offsetY = event.clientY - top;
	    }

	    function mouseMove(event) {
	        if (!isDown) {
	            return;
	        }
	        var dx = event.clientX - offsetX;
	        var dy = event.clientY - offsetY;

	        _this.container.style.left = dx + 'px';
	        _this.container.style.top = dy + 'px';
	    }

	    function mouseUp(event) {
	        isDown = false;
	        offsetX = 0;
	        offsetY = 0;
	    }

	    this.header.dom.addEventListener('mousedown', mouseDown);
	    document.body.addEventListener('mousemove', mouseMove);
	    document.body.addEventListener('mouseup', mouseUp);
	};

	/**
	 * 图片
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Image$1(options) {
	    Control.call(this, options);
	    options = options || {};

	    // 背景图片
	    this.src = options.src || null;
	    this.title = options.title || null;
	    this.alt = options.alt || null;
	    this.cls = options.cls || 'Item';
	    this.style = options.style || null;

	    // 字体图标
	    this.icon = options.icon || null;

	    // 左上角文本
	    this.cornerText = options.cornerText || null;

	    this.onClick = options.onClick || null;
	}

	Image$1.prototype = Object.create(Control.prototype);
	Image$1.prototype.constructor = Image$1;

	Image$1.prototype.render = function () {
	    this.dom = document.createElement('div');
	    this.parent.appendChild(this.dom);

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    // 背景图片
	    if (this.src) {
	        this.img = document.createElement('img');

	        this.img.src = this.src;

	        if (this.title) {
	            this.img.title = this.title;
	        }

	        if (this.alt) {
	            this.img.alt = this.alt;
	        }

	        this.dom.appendChild(this.img);
	    } else if (this.icon) { // 没图片则显示字体图标
	        this.i = document.createElement('i');
	        this.i.className = `iconfont ${this.icon}`;
	        this.dom.appendChild(this.i);
	    }

	    // 左上角文本
	    if (this.cornerText) {
	        this.corner = document.createElement('span');
	        this.corner.className = 'cornerText';
	        this.corner.innerHTML = this.cornerText;
	        this.dom.appendChild(this.corner);
	    }

	    // 事件
	    var _this = this;

	    function onClick(event, type) {
	        event.stopPropagation();
	        event.preventDefault();
	        if (_this.onClick) {
	            _this.onClick.call(_this, event, type);
	        }
	    }
	    this.dom.addEventListener('click', (event) => onClick(event, 'default'));

	    // 操作按钮
	    this.editBtn = UI.create({
	        xtype: 'iconbutton',
	        icon: 'icon-edit',
	        cls: 'Button IconButton EditButton',
	        title: '编辑',
	        onClick: (event) => onClick(event, 'edit')
	    });
	    this.editBtn.render();

	    this.dom.appendChild(this.editBtn.dom);

	    this.deleteBtn = UI.create({
	        xtype: 'iconbutton',
	        icon: 'icon-delete',
	        cls: 'Button IconButton DeleteButton',
	        title: '删除',
	        onClick: (event) => onClick(event, 'delete')
	    });
	    this.deleteBtn.render();

	    this.dom.appendChild(this.deleteBtn.dom);
	};

	/**
	 * 图片列表
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function ImageList(options = {}) {
	    Container.call(this, options);

	    this.cls = options.cls || 'ImageList';
	    this.style = options.style || {
	        width: '800px',
	        height: '500px'
	    };

	    this.onClick = options.onClick || null;
	}

	ImageList.prototype = Object.create(Container.prototype);
	ImageList.prototype.constructor = ImageList;

	ImageList.prototype.render = function () {
	    this.dom = document.createElement('div');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.dom.style.width = this.width;
	    this.dom.style.height = this.height;

	    this.dom.style.flex = this.flex;

	    this.parent.appendChild(this.dom);

	    function onClick(event, type) {
	        var index;
	        if (type === 'edit' || type === 'delete') {
	            index = event.target.parentNode.dataIndex;
	        } else {
	            index = event.target.dataIndex;
	        }

	        if (this.onClick) {
	            this.onClick(event, index, type, this);
	        }
	    }
	    this.children.forEach((n, i) => {
	        // 容器
	        var container = document.createElement('div');
	        container.className = 'Container';
	        this.dom.appendChild(container);

	        // 图片
	        var title = n.title;
	        n.title = null;
	        var obj = UI.create(n);
	        if (!(obj instanceof Image$1)) {
	            console.warn(`ImageList: obj is not an instance of Image.`);
	        }

	        obj.parent = container;
	        obj.onClick = onClick.bind(this);
	        obj.render();
	        obj.dom.dataIndex = i; // 序号
	        obj.editBtn.dom.dataIndex = i;
	        obj.deleteBtn.dom.dataIndex = i;

	        // 说明
	        var description = document.createElement('div');
	        description.className = 'title';
	        description.innerHTML = title;
	        container.appendChild(description);
	    });
	};

	/**
	 * 消息框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function MessageBox(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.time = options.time || 3000;
	}
	MessageBox.prototype = Object.create(Container.prototype);
	MessageBox.prototype.constructor = MessageBox;

	MessageBox.prototype.render = function () {
	    this.dom = document.createElement('div');
	    this.dom.className = 'MessageBox';
	    this.parent.appendChild(this.dom);
	};

	MessageBox.prototype.show = function (html) {
	    this.dom.innerHTML = html;
	    this.dom.display = 'block';

	    // 设置居中
	    this.dom.style.left = (this.parent.clientWidth - this.dom.clientWidth) / 2 + 'px';
	    this.dom.style.top = (this.parent.clientHeight - this.dom.clientHeight) / 2 + 'px';

	    if (this.time > 0) {
	        setTimeout(() => {
	            this.destroy();
	        }, this.time);
	    }
	};

	MessageBox.prototype.hide = function () {
	    this.dom.display = 'none';
	};

	/**
	 * 表格
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置
	 */
	function Table(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'Table';
	    this.style = options.style || {};
	}

	Table.prototype = Object.create(Container.prototype);
	Table.prototype.constructor = Table;

	Table.prototype.render = function () {
	    this.dom = document.createElement('table');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.children.forEach((n) => {
	        var obj = UI.create(n);
	        obj.parent = this.dom;
	        obj.render();
	    });
	};

	/**
	 * 表格头部
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置
	 */
	function TableHead(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'TableHead';
	    this.style = options.style || {};
	}

	TableHead.prototype = Object.create(Container.prototype);
	TableHead.prototype.constructor = TableHead;

	TableHead.prototype.render = function () {
	    this.dom = document.createElement('thead');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.children.forEach((n) => {
	        var obj = UI.create(n);
	        obj.parent = this.dom;
	        obj.render();
	    });
	};

	/**
	 * 表格身体
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置
	 */
	function TableBody(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'TableBody';
	    this.style = options.style || {};
	}

	TableBody.prototype = Object.create(Container.prototype);
	TableBody.prototype.constructor = TableBody;

	TableBody.prototype.render = function () {
	    this.dom = document.createElement('tbody');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.children.forEach((n) => {
	        var obj = UI.create(n);
	        obj.parent = this.dom;
	        obj.render();
	    });
	};

	/**
	 * 表格一行
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置
	 */
	function TableRow(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.cls = options.cls || 'TableRow';
	    this.style = options.style || {};
	}

	TableRow.prototype = Object.create(Container.prototype);
	TableRow.prototype.constructor = TableRow;

	TableRow.prototype.render = function () {
	    this.dom = document.createElement('tr');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    this.children.forEach((n) => {
	        var obj = UI.create(n);
	        obj.parent = this.dom;
	        obj.render();
	    });
	};

	/**
	 * 表格一个单元格
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 配置
	 */
	function TableData(options) {
	    Container.call(this, options);
	    options = options || {};

	    this.html = options.html || null;

	    this.cls = options.cls || 'TableData';
	    this.style = options.style || {};
	}

	TableData.prototype = Object.create(Container.prototype);
	TableData.prototype.constructor = TableData;

	TableData.prototype.render = function () {
	    this.dom = document.createElement('td');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);

	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    }

	    this.children.forEach((n) => {
	        var obj = UI.create(n);
	        obj.parent = this.dom;
	        obj.render();
	    });
	};

	/**
	 * 提示框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Alert(options) {
	    Window.call(this, options);
	    options = options || {};

	    this.title = options.title || '消息';
	    this.content = options.content || '';

	    this.okText = options.okText || '确认';

	    this.width = options.width || '320px';
	    this.height = options.height || '150px';

	    this.callback = options.callback || null;
	}

	Alert.prototype = Object.create(Window.prototype);
	Alert.prototype.constructor = Alert;

	Alert.prototype.render = function () {
	    this.children = [{
	        xtype: 'html',
	        html: this.content
	    }];

	    this.buttons = [{
	        xtype: 'button',
	        text: this.okText,
	        onClick: (event) => {
	            var result = true;

	            if (this.callback) {
	                result = this.callback.call(this, event);
	            }

	            if (result !== false) {
	                this.hide();
	            }
	        }
	    }];

	    Window.prototype.render.call(this);
	};

	/**
	 * 询问对话框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Confirm(options) {
	    Window.call(this, options);
	    options = options || {};

	    this.title = options.title || '询问';
	    this.content = options.content || '';

	    this.okText = options.okText || '确认';
	    this.cancelText = options.cancelText || '取消';

	    this.width = options.width || '320px';
	    this.height = options.height || '150px';

	    this.callback = options.callback || null;
	}

	Confirm.prototype = Object.create(Window.prototype);
	Confirm.prototype.constructor = Confirm;

	Confirm.prototype.render = function () {
	    this.children = [{
	        xtype: 'html',
	        html: this.content
	    }];

	    var _this = this;

	    function onClick(event, btn) {
	        if (_this.callback) {
	            if (_this.callback.call(_this, event, btn) !== false) {
	                _this.hide();
	            }
	        }
	    }

	    this.buttons = [{
	        xtype: 'button',
	        text: this.okText,
	        onClick: (event) => {
	            onClick(event, 'ok');
	        }
	    }, {
	        xtype: 'button',
	        text: this.cancelText,
	        onClick: (event) => {
	            onClick(event, 'cancel');
	        }
	    }];

	    Window.prototype.render.call(this);
	};

	/**
	 * 提示输入框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Prompt(options) {
	    Window.call(this, options);
	    options = options || {};

	    this.title = options.title || '请输入';
	    this.label = options.label || '';
	    this.value = options.value || '';

	    this.okText = options.okText || '确认';
	    this.cancelText = options.cancelText || '取消';

	    this.width = options.width || '320px';
	    this.height = options.height || '150px';

	    this.bodyStyle = options.bodyStyle || {
	        display: 'flex',
	        flexDirection: 'row',
	        alignItems: 'center',
	        justifyContent: this.label == null || this.label.trim() == '' ? 'center' : 'space-around'
	    };

	    this.callback = options.callback || null;
	}

	Prompt.prototype = Object.create(Window.prototype);
	Prompt.prototype.constructor = Prompt;

	Prompt.prototype.render = function () {
	    this.children = [{
	        xtype: 'label',
	        text: this.label
	    }, {
	        xtype: 'input',
	        id: `${this.id}-input`,
	        value: this.value
	    }];

	    this.buttons = [{
	        xtype: 'button',
	        text: this.okText,
	        onClick: (event) => {
	            var result = true;

	            var value = UI.get(`${this.id}-input`).dom.value;

	            if (this.callback) {
	                result = this.callback.call(this, event, value);
	            }

	            if (result !== false) {
	                this.hide();
	            }
	        }
	    }, {
	        xtype: 'button',
	        text: this.cancelText,
	        onClick: (event) => {
	            this.hide();
	        }
	    }];

	    Window.prototype.render.call(this);
	};

	/**
	 * 搜索框
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 搜索框
	 */
	function SearchField(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.showSearchButton = options.showSearchButton === undefined ? true : options.showSearchButton;
	    this.showResetButton = options.showResetButton === undefined ? false : options.showResetButton;

	    this.cls = options.cls || 'SearchField';
	    this.style = options.style || {};

	    this.onSearch = options.onSearch || null;
	    this.onInput = options.onInput || null;
	}

	SearchField.prototype = Object.create(Control.prototype);
	SearchField.prototype.constructor = SearchField;

	SearchField.prototype.render = function () {
	    this.children = [{
	        xtype: 'div',
	        parent: this.parent,
	        cls: this.cls,
	        style: this.style,
	        children: [{
	            xtype: 'input',
	            id: `${this.id}-input`,
	            scope: this.scope,
	            placeholder: '搜索内容',
	            onInput: this.onInput == null ? null : this.onInput.bind(this)
	        }]
	    }];

	    if (this.showSearchButton) {
	        this.children[0].children.push({
	            xtype: 'iconbutton',
	            icon: 'icon-search',
	            onClick: this.onSearch == null ? null : this.onSearch.bind(this)
	        });
	    }

	    if (this.showResetButton) {
	        this.children[0].children.push({
	            xtype: 'iconbutton',
	            icon: 'icon-close',
	            onClick: (event) => {
	                this.reset();
	                if (this.onInput) {
	                    this.onInput(event);
	                }
	                if (this.onSearch) {
	                    this.onSearch(event);
	                }
	            }
	        });
	    }

	    var control = UI.create(this.children[0]);
	    control.render();

	    this.dom = control.dom;
	};

	SearchField.prototype.getValue = function () {
	    return UI.get(`${this.id}-input`, this.scope).dom.value;
	};

	SearchField.prototype.setValue = function (value) {
	    UI.get(`${this.id}-input`, this.scope).dom.value = value;
	};

	SearchField.prototype.reset = function () {
	    this.setValue('');
	};

	/**
	 * 工具栏填充器
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ToolbarFiller(options) {
	    Control.call(this, options);
	}

	ToolbarFiller.prototype = Object.create(Control.prototype);
	ToolbarFiller.prototype.constructor = ToolbarFiller;

	ToolbarFiller.prototype.render = function () {
	    this.children = [{
	        xtype: 'div',
	        parent: this.parent,
	        style: {
	            flex: 1
	        }
	    }];

	    var control = UI.create(this.children[0]);
	    control.render();
	    this.dom = control.dom;
	};

	/**
	 * Canvas元素
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Canvas(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.cls = options.cls || null;
	    this.style = options.style || null;
	}
	Canvas.prototype = Object.create(Control.prototype);
	Canvas.prototype.constructor = Canvas;

	Canvas.prototype.render = function () {
	    this.dom = document.createElement('canvas');

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.parent.appendChild(this.dom);
	};

	/**
	 * 时间轴
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 * @description 时间轴代码来自https://github.com/mrdoob/frame.js/blob/master/editor/js/Timeline.js
	 */
	function Timeline(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.duration = options.duration || 120; // 持续时长(秒)
	    this.scale = options.scale || 30; // 尺寸，1秒=30像素

	    this.cls = options.cls || 'TimeLine';
	    this.style = options.style || null;
	}
	Timeline.prototype = Object.create(Control.prototype);
	Timeline.prototype.constructor = Timeline;

	Timeline.prototype.render = function () {
	    this.dom = document.createElement('canvas');
	    this.parent.appendChild(this.dom);

	    this.dom.width = this.dom.clientWidth;
	    this.dom.height = this.dom.clientHeight;

	    this.dom.className = this.cls;

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    this.drawTimeline();
	};

	Timeline.prototype.drawTimeline = function () {
	    var duration = this.duration; // 持续秒数
	    var scale = this.scale; // 1秒像素数
	    var width = duration * scale; // 画布宽度
	    var scale5 = scale / 5; // 0.2秒像素数
	    var margin = 0; // 时间轴前后间距

	    this.dom.style.width = (width + margin * 2) + 'px';
	    this.dom.width = this.dom.clientWidth;

	    var context = this.dom.getContext('2d');

	    // 时间轴背景
	    context.fillStyle = '#eee';
	    context.fillRect(0, 0, this.dom.width, this.dom.height);

	    // 时间轴刻度
	    context.strokeStyle = '#555';
	    context.beginPath();

	    for (var i = margin; i <= width + margin; i += scale) { // 绘制每一秒
	        for (var j = 0; j < 5; j++) { // 绘制每个小格
	            if (j === 0) { // 长刻度
	                context.moveTo(i + scale5 * j, 22);
	                context.lineTo(i + scale5 * j, 30);
	            } else { // 短刻度
	                context.moveTo(i + scale5 * j, 26);
	                context.lineTo(i + scale5 * j, 30);
	            }
	        }
	    }

	    context.stroke();

	    // 时间轴文字
	    context.font = '12px Arial';
	    context.fillStyle = '#888';

	    for (var i = 0; i <= duration; i += 2) { // 对于每两秒
	        var minute = Math.floor(i / 60);
	        var second = Math.floor(i % 60);

	        var text = (minute > 0 ? minute + ':' : '') + ('0' + second).slice(-2);

	        if (i === 0) {
	            context.textAlign = 'left';
	        } else if (i === duration) {
	            context.textAlign = 'right';
	        } else {
	            context.textAlign = 'center';
	        }

	        context.fillText(text, margin + i * scale, 16);
	    }
	};

	Timeline.prototype.updateUI = function () {
	    if (this.dom === undefined) {
	        this.render();
	        return;
	    }

	    this.dom.width = this.dom.clientWidth;
	    this.dom.height = this.dom.clientHeight;

	    this.drawTimeline();
	};

	/**
	 * 文件上传器
	 * @author tengge / https://github.com/tengge1
	 */
	function Uploader() {

	}

	/**
	 * 上传文件
	 * @param {*} input_id 文件input的id
	 * @param {*} url 后台接收上传文件url
	 * @param {*} onload 上传完成回调函数
	 * @param {*} onerror 上传出错回调函数
	 * @param {*} onprogress 上传过程回调函数
	 */
	Uploader.prototype.upload = function (input_id, url, onload, onerror, onprogress) {
	    var fileObj = document.getElementById(input_id).files[0];

	    var form = new FormData();
	    form.append("file", fileObj);

	    var xhr = new XMLHttpRequest();
	    xhr.open("post", url, true);
	    xhr.onload = onload;
	    xhr.onerror = onerror;
	    xhr.upload.onprogress = onprogress;
	    xhr.send(form);
	};

	const uploader = new Uploader();

	/**
	 * 上传工具类
	 */
	const UploadUtils = {
	    upload: uploader.upload
	};

	/**
	 * 图片列表窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ImageListWindow(options) {
	    Control.call(this, options);

	    this.title = options.title || '图片列表';
	    this.width = options.width || '700px';
	    this.height = options.height || '500px';

	    this.imageIcon = options.imageIcon || null; // 图片列表默认图标
	    this.nameField = options.nameField || 'Name'; // 名称字段，用于显示图片标题，按文字搜索
	    this.firstPinYinField = options.firstPinYinField || 'FirstPinYin'; // 拼音首字母字段，用于搜索
	    this.totalPinYinField = options.totalPinYinField || 'TotalPinYin'; // 全拼字段，用于搜索
	    this.cornerTextField = options.cornerTextField || null; // 显示在左上角文字字段
	    this.imageField = options.imageField || 'Thumbnail'; // 图片字段，用于显示缩略图
	    this.uploadUrl = options.uploadUrl || '/api/Upload/Upload';
	    this.preImageUrl = options.preImageUrl || '/'; // 缩略图url前缀，一般是服务端url
	    this.showUploadButton = options.showUploadButton || false; // 是否显示上传按钮

	    this.settingPanel = options.settingPanel || null; // 设置面板，格式：{ xtype: 'div', children: [ ... ] }

	    this.beforeUpdateList = options.beforeUpdateList || this.beforeUpdateList; // 图片列表刷新前调用，返回Promise，resolve(data)。
	    this.onUpload = options.onUpload || this.onUpload; // 上传成功回调
	    this.onClick = options.onClick || this.onClick; // 点击图片列表
	    this.onEdit = options.onEdit || this.onEdit; // 编辑图片列表
	    this.onDelete = options.onDelete || this.onDelete; // 删除图片列表

	    this.data = [];
	    this.keyword = '';

	    this.input = document.createElement('input');
	    this.input.id = `file_${this.id}`;
	    this.input.type = 'file';
	    this.input.style.display = 'none';
	    this.input.addEventListener('change', this.onChange.bind(this));
	    document.body.appendChild(this.input);
	}

	ImageListWindow.prototype = Object.create(Control.prototype);
	ImageListWindow.prototype.constructor = ImageListWindow;

	ImageListWindow.prototype.render = function () {
	    var data = {
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: this.title,
	        width: this.width,
	        height: this.height,
	        bodyStyle: {
	            paddingTop: 0,
	            display: 'flex',
	            flexDirection: 'row'
	        },
	        shade: false,
	        children: [{
	            xtype: 'div',
	            style: {
	                flex: 1
	            },
	            children: [{
	                xtype: 'row',
	                style: {
	                    position: 'sticky',
	                    top: '0',
	                    padding: '2px',
	                    backgroundColor: '#eee',
	                    borderBottom: '1px solid #ddd',
	                    zIndex: 100,
	                    display: 'flex',
	                    alignItems: 'center',
	                    justifyContent: 'flex-start'
	                },
	                children: [{
	                    xtype: 'searchfield',
	                    id: 'search',
	                    scope: this.id,
	                    showSearchButton: false,
	                    showResetButton: true,
	                    onInput: this.onInputSearchField.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'imagelist',
	                    id: 'windowImages',
	                    scope: this.id,
	                    style: {
	                        width: '100%',
	                        height: '100%',
	                    },
	                    onClick: this.onClickImage.bind(this)
	                }]
	            }]
	        }]
	    };

	    if (this.showUploadButton) {
	        data.children[0].children[0].children.splice(0, 0, {
	            xtype: 'button',
	            text: '上传',
	            onClick: this.onClickUpload.bind(this)
	        });
	        data.children[0].children[0].children[1].style = {
	            position: 'absolute',
	            right: 0,
	            marginRight: '8px'
	        };
	    }

	    if (this.settingPanel) {
	        data.children.push(this.settingPanel);
	    }

	    var container = UI.create(data);
	    container.render();
	};

	ImageListWindow.prototype.show = function () {
	    UI.get('window', this.id).show();
	    this.update();
	};

	ImageListWindow.prototype.hide = function () {
	    UI.get('window', this.id).hide();
	};

	ImageListWindow.prototype.update = function () {
	    this.keyword = '';

	    if (typeof (this.beforeUpdateList) === 'function') {
	        this.beforeUpdateList().then((data) => {
	            this.data = data;
	            this.onSearch(this.keyword);
	        });
	    }
	};

	ImageListWindow.prototype.onClickUpload = function () {
	    this.input.value = null;
	    this.input.click();
	};

	ImageListWindow.prototype.onChange = function () {
	    UploadUtils.upload(`file_${this.id}`, this.uploadUrl, event => {
	        if (event.target.status === 200) {
	            var response = event.target.response;
	            var obj = JSON.parse(response);
	            this.onUpload(obj);
	        } else {
	            UI.msg('上传失败！');
	        }
	    }, () => {
	        UI.msg('上传失败！');
	    });
	};

	ImageListWindow.prototype.onSearch = function (name) {
	    if (name.trim() === '') {
	        this.renderImages(this.data);
	        return;
	    }

	    name = name.toLowerCase();

	    var models = this.data.filter((n) => {
	        return n[this.nameField].indexOf(name) > -1 ||
	            n[this.firstPinYinField].indexOf(name) > -1 ||
	            n[this.totalPinYinField].indexOf(name) > -1;
	    });
	    this.renderImages(models);
	};

	ImageListWindow.prototype.onInputSearchField = function () {
	    var search = UI.get('search', this.id);
	    this.onSearch(search.getValue());
	};

	ImageListWindow.prototype.renderImages = function (models) {
	    var images = UI.get('windowImages', this.id);
	    images.clear();

	    images.children = models.map(n => {
	        return {
	            xtype: 'image',
	            src: (n[this.imageField] === undefined || n[this.imageField] === null || n[this.imageField].trim() === '') ? null : (this.preImageUrl + n[this.imageField]),
	            title: n[this.nameField],
	            data: n,
	            icon: this.imageIcon,
	            cornerText: this.cornerTextField === null ? null : n[this.cornerTextField],
	            style: {
	                backgroundColor: '#eee'
	            }
	        };
	    });
	    images.render();
	};

	ImageListWindow.prototype.onClickImage = function (event, index, btn, control) {
	    var data = control.children[index].data;

	    if (btn === 'edit') {
	        if (typeof (this.onEdit) === 'function') {
	            this.onEdit(data);
	        }
	    } else if (btn === 'delete') {
	        if (typeof (this.onDelete) === 'function') {
	            this.onDelete(data);
	        }
	    } else {
	        if (typeof (this.onClick) === 'function') {
	            this.onClick(data);
	        }
	    }
	};

	/**
	 * 图片上传控件
	 * @param {*} options 
	 */
	function ImageUploader(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.url = options.url || null;
	    this.server = options.server || '';

	    this.input = document.createElement('input');
	    this.input.id = `file_${this.id}`;
	    this.input.type = 'file';
	    this.input.style.display = 'none';
	    this.input.addEventListener('change', this.onChange.bind(this));
	    document.body.appendChild(this.input);
	}

	ImageUploader.prototype = Object.create(Control.prototype);
	ImageUploader.prototype.constructor = ImageUploader;

	ImageUploader.prototype.render = function () {
	    if (this.dom) {
	        this.dom.removeEventListener('click', this.onClick.bind(this));
	        this.parent.removeChild(this.dom);
	    }

	    if (this.url) {
	        this.dom = document.createElement('img');
	        this.dom.className = 'Uploader';
	        this.dom.src = this.server + this.url;
	    } else {
	        this.dom = document.createElement('div');
	        this.dom.className = 'NoImage';
	        this.dom.innerHTML = '暂无图片';
	    }
	    this.parent.appendChild(this.dom);
	    this.dom.addEventListener('click', this.onClick.bind(this));
	    this.input.value = null;
	};

	ImageUploader.prototype.onClick = function () {
	    this.input.click();
	};

	ImageUploader.prototype.getValue = function () {
	    return this.url;
	};

	ImageUploader.prototype.setValue = function (url) {
	    this.url = url;
	    this.render();
	};

	ImageUploader.prototype.onChange = function () {
	    UploadUtils.upload(`file_${this.id}`, `${this.server}/api/Upload/Upload`, event => {
	        if (event.target.status === 200) {
	            var response = event.target.response;
	            var obj = JSON.parse(response);
	            var url = obj.Data.url;
	            this.setValue(url);
	        } else {
	            UI.msg('图片上传失败！');
	        }
	    }, () => {
	        UI.msg('图片上传失败！');
	    });
	};

	/**
	 * 链接按钮
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function LinkButton(options) {
	    Control.call(this, options);
	    options = options || {};

	    this.text = options.text || 'Button';
	    this.cls = options.cls || null;
	    this.style = options.style || null;
	    this.title = options.title || null;

	    this.onClick = options.onClick || null;
	}
	LinkButton.prototype = Object.create(Control.prototype);
	LinkButton.prototype.constructor = LinkButton;

	LinkButton.prototype.render = function () {
	    this.dom = document.createElement('a');

	    this.dom.href = 'javascript:;';

	    this.dom.innerHTML = this.text;

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.title) {
	        this.dom.title = this.title;
	    }

	    this.parent.appendChild(this.dom);

	    if (this.onClick) {
	        this.dom.addEventListener('click', this.onClick.bind(this), false);
	    }
	};

	LinkButton.prototype.setText = function (text) {
	    this.text = text;
	    this.dom.innerHTML = this.text;
	};

	/**
	 * UI类
	 * @author tengge / https://github.com/tengge1
	 */
	function UICls() {
	    this.xtypes = {};
	    this.objects = {};
	}

	/**
	 * 添加xtype
	 * @param {*} name xtype字符串
	 * @param {*} cls xtype对应类
	 */
	UICls.prototype.addXType = function (name, cls) {
	    if (this.xtypes[name] === undefined) {
	        this.xtypes[name] = cls;
	    } else {
	        console.warn(`UICls: xtype named ${name} has already been added.`);
	    }
	};

	/**
	 * 删除xtype
	 * @param {*} name xtype字符串
	 */
	UICls.prototype.removeXType = function (name) {
	    if (this.xtypes[name] !== undefined) {
	        delete this.xtypes[name];
	    } else {
	        console.warn(`UICls: xtype named ${name} is not defined.`);
	    }
	};

	/**
	 * 获取xtype
	 * @param {*} name xtype字符串
	 */
	UICls.prototype.getXType = function (name) {
	    if (this.xtypes[name] === undefined) {
	        console.warn(`UICls: xtype named ${name} is not defined.`);
	    }
	    return this.xtypes[name];
	};

	/**
	 * 添加一个对象到缓存
	 * @param {*} id 对象id
	 * @param {*} obj 对象
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.add = function (id, obj, scope = "global") {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] !== undefined) {
	        console.warn(`UICls: object named ${id} has already been added.`);
	    }
	    this.objects[key] = obj;
	};

	/**
	 * 从缓存中移除一个对象
	 * @param {*} id 对象id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.remove = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] != undefined) {
	        delete this.objects[key];
	    } else {
	        console.warn(`UICls: object named ${id} is not defined.`);
	    }
	};

	/**
	 * 从缓存中获取一个对象
	 * @param {*} id 控件id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.get = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    // 经常需要通过该方法判断是否已经注册某个元素，所以不能产生警告。
	    // if (this.objects[key] === undefined) {
	    //     console.warn(`UICls: object named ${id} is not defined.`);
	    // }
	    return this.objects[key];
	};

	/**
	 * 通过json配置创建UI实例，并自动将包含id的控件添加到缓存
	 * @param {*} config xtype配置
	 */
	UICls.prototype.create = function (config) {
	    if (config instanceof Control) { // config是Control实例
	        return config;
	    }

	    // config是json配置
	    if (config == null || config.xtype == null) {
	        throw 'UICls: config is undefined.';
	    }

	    if (config.xtype === undefined) {
	        throw 'UICls: config.xtype is undefined.';
	    }

	    var cls = this.xtypes[config.xtype];
	    if (cls == null) {
	        throw `UICls: xtype named ${config.xtype} is undefined.`;
	    }

	    return new cls(config);
	};

	/**
	 * UICls唯一一个实例
	 */
	const UI$1 = new UICls();

	// 添加所有控件
	Object.assign(UI$1, {
	    Boolean: Boolean,
	    Break: Break,
	    Button: Button,
	    Checkbox: Checkbox,
	    CloseButton: CloseButton,
	    Color: Color,
	    Container: Container,
	    Control: Control,
	    Div: Div,
	    HorizontalRule: HorizontalRule,
	    Html: Html,
	    IconButton: IconButton,
	    Input: Input,
	    Integer: Integer,
	    Label: Label,
	    Modal: Modal,
	    Number: Number$1,
	    Outliner: Outliner,
	    Row: Row,
	    Select: Select,
	    Span: Span,
	    Text: Text,
	    TextArea: TextArea,
	    Texture: Texture,
	    Window: Window,
	    Image: Image$1,
	    ImageList: ImageList,
	    MessageBox: MessageBox,
	    Table: Table,
	    TableHead: TableHead,
	    TableBody: TableBody,
	    TableRow: TableRow,
	    TableData: TableData,
	    Alert: Alert,
	    Confirm: Confirm,
	    Prompt: Prompt,
	    SearchField: SearchField,
	    ToolbarFiller: ToolbarFiller,
	    Canvas: Canvas,
	    Timeline: Timeline,
	    ImageListWindow: ImageListWindow,
	    ImageUploader: ImageUploader,
	    LinkButton: LinkButton
	});

	// 添加所有控件的XType
	UI$1.addXType('boolean', Boolean);
	UI$1.addXType('br', Break);
	UI$1.addXType('button', Button);
	UI$1.addXType('checkbox', Checkbox);
	UI$1.addXType('closebutton', CloseButton);
	UI$1.addXType('color', Color);
	UI$1.addXType('container', Container);
	UI$1.addXType('control', Control);
	UI$1.addXType('div', Div);
	UI$1.addXType('hr', HorizontalRule);
	UI$1.addXType('html', Html);
	UI$1.addXType('iconbutton', IconButton);
	UI$1.addXType('input', Input);
	UI$1.addXType('int', Integer);
	UI$1.addXType('label', Label);
	UI$1.addXType('modal', Modal);
	UI$1.addXType('number', Number$1);
	UI$1.addXType('outliner', Outliner);
	UI$1.addXType('row', Row);
	UI$1.addXType('select', Select);
	UI$1.addXType('span', Span);
	UI$1.addXType('text', Text);
	UI$1.addXType('textarea', TextArea);
	UI$1.addXType('texture', Texture);
	UI$1.addXType('window', Window);
	UI$1.addXType('image', Image$1);
	UI$1.addXType('imagelist', ImageList);
	UI$1.addXType('msg', MessageBox);
	UI$1.addXType('table', Table);
	UI$1.addXType('thead', TableHead);
	UI$1.addXType('tbody', TableBody);
	UI$1.addXType('tr', TableRow);
	UI$1.addXType('td', TableData);
	UI$1.addXType('alert', Alert);
	UI$1.addXType('confirm', Confirm);
	UI$1.addXType('prompt', Prompt);
	UI$1.addXType('searchfield', SearchField);
	UI$1.addXType('toolbarfiller', ToolbarFiller);
	UI$1.addXType('canvas', Canvas);
	UI$1.addXType('timeline', Timeline);
	UI$1.addXType('imagelistwindow', ImageListWindow);
	UI$1.addXType('imageuploader', ImageUploader);
	UI$1.addXType('linkbutton', LinkButton);

	// 添加一些实用功能
	Object.assign(UI$1, {
	    msg: function (text) { // 简洁消息提示框，5秒自动消息并销毁dom
	        var msg = UI$1.create({ xtype: 'msg' });
	        msg.render();
	        msg.show(text);
	    },

	    alert: function (title, content, callback) { // 消息框，点击确认/关闭窗口后自动销毁dom
	        var alert = UI$1.create({
	            xtype: 'alert',
	            title: title,
	            content: content,
	            callback: function (event) {
	                var result = true;

	                if (callback) {
	                    result = callback(event);
	                }

	                if (result !== false) {
	                    this.destroy(); // 销毁dom
	                }

	                return result; // 返回true关闭窗口，返回false不关闭窗口
	            }
	        });
	        alert.render();
	        alert.show();
	    },

	    confirm: function (title, content, callback) { // 询问对话框，点击确认/取消/关闭后自动销毁dom
	        var confirm = UI$1.create({
	            xtype: 'confirm',
	            title: title,
	            content: content,
	            callback: function (event, btn) {
	                var result = true;

	                if (callback) {
	                    result = callback(event, btn);
	                }

	                if (result !== false) {
	                    this.destroy(); // 销毁dom
	                }

	                return result; // 返回true关闭窗口，返回false不关闭窗口
	            }
	        });
	        confirm.render();
	        confirm.show();
	    },

	    prompt: function (title, label, value, callback) {
	        var prompt = UI$1.create({
	            xtype: 'prompt',
	            title: title,
	            label: label,
	            value: value,
	            callback: function (event, value) {
	                var result = true;

	                if (callback) {
	                    result = callback(event, value);
	                }

	                if (result !== false) {
	                    this.destroy(); // 销毁dom
	                }

	                return result; // 返回true关闭窗口，返回false不关闭窗口
	            }
	        });
	        prompt.render();
	        prompt.show();
	    }
	});

	window.UI = UI$1;

	window.URL = window.URL || window.webkitURL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

	Number.prototype.format = function () {
	    return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};

	var noop = {value: function() {}};

	function dispatch() {
	  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
	    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
	    _[t] = [];
	  }
	  return new Dispatch(_);
	}

	function Dispatch(_) {
	  this._ = _;
	}

	function parseTypenames(typenames, types) {
	  return typenames.trim().split(/^|\s+/).map(function(t) {
	    var name = "", i = t.indexOf(".");
	    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
	    return {type: t, name: name};
	  });
	}

	Dispatch.prototype = dispatch.prototype = {
	  constructor: Dispatch,
	  on: function(typename, callback) {
	    var _ = this._,
	        T = parseTypenames(typename + "", _),
	        t,
	        i = -1,
	        n = T.length;

	    // If no callback was specified, return the callback of the given type and name.
	    if (arguments.length < 2) {
	      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
	      return;
	    }

	    // If a type was specified, set the callback for the given type and name.
	    // Otherwise, if a null callback was specified, remove callbacks of the given name.
	    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
	    while (++i < n) {
	      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
	      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
	    }

	    return this;
	  },
	  copy: function() {
	    var copy = {}, _ = this._;
	    for (var t in _) copy[t] = _[t].slice();
	    return new Dispatch(copy);
	  },
	  call: function(type, that) {
	    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  },
	  apply: function(type, that, args) {
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  }
	};

	function get(type, name) {
	  for (var i = 0, n = type.length, c; i < n; ++i) {
	    if ((c = type[i]).name === name) {
	      return c.value;
	    }
	  }
	}

	function set(type, name, callback) {
	  for (var i = 0, n = type.length; i < n; ++i) {
	    if (type[i].name === name) {
	      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
	      break;
	    }
	  }
	  if (callback != null) type.push({name: name, value: callback});
	  return type;
	}

	/**
	 * 自定义事件列表
	 * @author tengge / https://github.com/tengge1
	 */
	var EventList = [
	    // dom事件
	    'click', // 点击
	    'contextmenu', // 右键
	    'dblclick', // 双击
	    'keydown', // 按下键盘按键
	    'keyup', // 抬起键盘按键
	    'mousedown', // 按下鼠标按键
	    'mousemove', // 鼠标移动
	    'mouseup', // 抬起鼠标按键
	    'mousewheel', // 鼠标滚轮
	    'resize', // 窗口大小改变
	    'dragover', // 拖动到某元素上
	    'drop', // 放置到某元素上

	    // app事件
	    'appStart', // 应用程序开始前调用
	    'appStarted', // 应用程序开始后调用
	    'appStop', // 程序开始结束前调用
	    'appStoped', // 程序结束后调用

	    // 配置
	    'optionsChanged', // 配置改变事件

	    // 菜单栏事件
	    'mAddMiku',

	    'mAddPhysicsPlane', // 添加平板
	    'mAddPhysicsWall', // 添加墙
	    'mAddPhysicsCloth', // 添加布料
	    'mThrowBall', // 探测小球

	    // 工具栏事件

	    'changeMode', // 改变模式（select, translate, rotate, scale, delete）

	    // editor事件
	    'select', // 选中事件
	    'clear', // 清空场景
	    'load', // 加载场景
	    'log', // 日志事件

	    // signal事件
	    'editScript', // 编辑脚本事件

	    'editorCleared', // 编辑器已经清空事件

	    'snapChanged', // 对齐单元格事件
	    'spaceChanged', // 空间坐标系改变事件

	    'sceneGraphChanged', // 场景内容改变事件

	    'cameraChanged', // 相机改变事件

	    'geometryChanged', // 几何体改变事件

	    'objectSelected', // 物体选中改变
	    'objectFocused', // 物体交点改变事件

	    'objectAdded', // 添加物体事件
	    'objectChanged', // 物体改变事件
	    'objectRemoved', // 物体移除事件

	    'materialChanged', // 材质改变事件

	    'scriptAdded', // 添加脚本事件
	    'scriptChanged', // 脚本改变事件
	    'scriptRemoved', // 脚本移除事件

	    'historyChanged', // 历史改变事件
	    'refreshScriptEditor', // 刷新脚本编辑器事件

	    // 场景编辑区
	    'transformControlsChange', // 变形控件改变
	    'transformControlsMouseDown', // 变形控件按下鼠标键
	    'transformControlsMouseUp', // 变形控件抬起鼠标键
	    'render', // 渲染一次场景
	    'animate', // 进行动画

	    // 侧边栏
	    'tabSelected', // 选项卡选中事件
	    'animationSelected', // 动画选中事件
	    'animationChanged', // 动画发生改变事件
	    'resetAnimation', // 重制动画时间轴
	    'startAnimation', // 开始播放动画
	    'animationTime', // 时间轴发送当前动画时间
	];

	var ID$1 = -1;

	/**
	 * 事件基类
	 * @author tengge / https://github.com/tengge1
	 */
	function BaseEvent(app) {
	    this.app = app;
	    this.id = `BaseEvent${ID$1--}`;
	}

	/**
	 * 开始执行
	 */
	BaseEvent.prototype.start = function () {

	};

	/**
	 * 停止执行
	 */
	BaseEvent.prototype.stop = function () {

	};

	/**
	 * 动画事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function AnimateEvent(app) {
	    BaseEvent.call(this, app);
	    this.running = false;
	    this.clock = new THREE.Clock();
	}

	AnimateEvent.prototype = Object.create(BaseEvent.prototype);
	AnimateEvent.prototype.constructor = AnimateEvent;

	AnimateEvent.prototype.start = function () {
	    this.running = true;
	    requestAnimationFrame(this.onAnimate.bind(this));
	};

	AnimateEvent.prototype.stop = function () {
	    this.running = false;
	};

	AnimateEvent.prototype.onAnimate = function () {
	    this.app.editor.stats.begin();

	    var deltaTime = this.clock.getDelta();

	    this.app.call('animate', this, this.clock, deltaTime);
	    this.app.call('render', this);

	    this.app.editor.stats.end();

	    if (this.running) {
	        requestAnimationFrame(this.onAnimate.bind(this));
	    }
	};

	/**
	 * 移除物体命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @constructor
	 */
	function RemoveObjectCommand(object) {
		Command.call(this);

		this.type = 'RemoveObjectCommand';
		this.name = '移除物体';

		this.object = object;

		this.parent = (object !== undefined) ? object.parent : undefined;

		if (this.parent !== undefined) {
			this.index = this.parent.children.indexOf(this.object);
		}
	}
	RemoveObjectCommand.prototype = Object.create(Command.prototype);

	Object.assign(RemoveObjectCommand.prototype, {
		constructor: RemoveObjectCommand,

		execute: function () {
			var scope = this.editor;
			this.object.traverse(function (child) {

				scope.removeHelper(child);

			});

			this.parent.remove(this.object);
			this.editor.select(this.parent);

			this.editor.app.call('objectRemoved', this, this.object);
			this.editor.app.call('sceneGraphChanged', this);
		},

		undo: function () {
			var scope = this.editor;

			this.object.traverse(function (child) {
				scope.addHelper(child);
			});

			this.parent.children.splice(this.index, 0, this.object);
			this.object.parent = this.parent;
			this.editor.select(this.object);

			this.editor.app.call('objectAdded', this, this.object);
			this.editor.app.call('sceneGraphChanged', this);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);
			output.object = this.object.toJSON();
			output.index = this.index;
			output.parentUuid = this.parent.uuid;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.parent = this.editor.objectByUuid(json.parentUuid);
			if (this.parent === undefined) {
				this.parent = this.editor.scene;
			}

			this.index = json.index;

			this.object = this.editor.objectByUuid(json.object.object.uuid);
			if (this.object === undefined) {
				var loader = new THREE.ObjectLoader();
				this.object = loader.parse(json.object);
			}
		}
	});

	/**
	 * 键盘按键事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function KeyDownEvent(app) {
	    BaseEvent.call(this, app);
	}

	KeyDownEvent.prototype = Object.create(BaseEvent.prototype);
	KeyDownEvent.prototype.constructor = KeyDownEvent;

	KeyDownEvent.prototype.start = function () {
	    this.app.on(`keydown.${this.id}`, this.onKeyDown.bind(this));
	};

	KeyDownEvent.prototype.stop = function () {
	    this.app.on(`keydown.${this.id}`, null);
	};

	KeyDownEvent.prototype.onKeyDown = function (event) {
	    var editor = this.app.editor;

	    switch (event.keyCode) {
	        case 8: // 回退键
	            event.preventDefault(); // 阻止浏览器返回
	            break;

	        case 46: // 删除键
	            var object = editor.selected;
	            if (object == null) {
	                return;
	            }
	            UI$1.confirm('询问', '删除 ' + object.name + '?', function (event, btn) {
	                if (btn === 'ok') {
	                    var parent = object.parent;
	                    if (parent !== null) editor.execute(new RemoveObjectCommand(object));
	                }
	            });
	            break;

	        case 90: // 注册Ctrl-Z撤销, Ctrl-Shift-Z重做
	            if (event.ctrlKey && event.shiftKey) {
	                editor.redo();
	            } else if (event.ctrlKey) {
	                editor.undo();
	            }
	            break;

	        case 87: // 注册 W 移动模式
	            this.app.call('changeMode', this, 'translate');
	            break;

	        case 69: // 注册 E 旋转模式
	            this.app.call('changeMode', this, 'rotate');
	            break;

	        case 82: // 注册 R 缩放模式
	            this.app.call('changeMode', this, 'scale');
	            break;
	    }
	};

	var ID$2 = -1;

	/**
	 * 特效基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function BaseEffect(app) {
	    this.app = app;
	    this.id = `BaseEffect${ID$2--}`;
	}
	BaseEffect.prototype.render = function (obj) {

	};

	var SelectVertexShader = "precision mediump float;\r\n\r\nuniform mat4 modelViewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nattribute vec3 position;\r\nattribute vec3 normal;\r\n\r\nvoid main()\t{\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * 0.01, 1.0);\r\n  gl_Position.z = gl_Position.z + 0.1;\r\n}";

	var SelectFragmentShader = "precision mediump float;\r\n\r\nvoid main()\t{\r\n\tgl_FragColor = vec4(0.925, 0.396, 0.102, 1.0); // 0xec651a\r\n}";

	/**
	 * 选中特效
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function SelectEffect(app) {
	    BaseEffect.call(this, app);
	    this.scene = new THREE.Scene();
	}
	SelectEffect.prototype = Object.create(BaseEffect.prototype);
	SelectEffect.prototype.constructor = SelectEffect;

	SelectEffect.prototype.render = function (obj) {
	    if (obj instanceof THREE.SkinnedMesh) {
	        return;
	    }

	    var renderer = this.app.editor.renderer;
	    var scene = this.scene;
	    var camera = this.app.editor.camera;

	    var geometry = obj.geometry;

	    var material = new THREE.RawShaderMaterial({
	        uniforms: {
	            time: {
	                value: 1.0
	            }
	        },
	        vertexShader: SelectVertexShader,
	        fragmentShader: SelectFragmentShader
	    });

	    var mesh = new THREE.Mesh(geometry, material);
	    mesh.position.copy(obj.position);
	    mesh.rotation.copy(obj.rotation);
	    mesh.scale.copy(obj.scale);

	    scene.children.length = 0;
	    scene.add(mesh);

	    renderer.render(scene, camera);
	};

	/**
	 * 渲染事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function RenderEvent(app) {
	    BaseEvent.call(this, app);
	    // this.sceneSelected = new THREE.Scene();
	    this.selectEffect = new SelectEffect(this.app);
	}

	RenderEvent.prototype = Object.create(BaseEvent.prototype);
	RenderEvent.prototype.constructor = RenderEvent;

	RenderEvent.prototype.start = function () {
	    this.app.on(`render.${this.id}`, this.onRender.bind(this));
	    this.app.on(`materialChanged.${this.id}`, this.onRender.bind(this));
	    this.app.on(`sceneGraphChanged.${this.id}`, this.onRender.bind(this));
	    this.app.on(`cameraChanged.${this.id}`, this.onRender.bind(this));
	};

	RenderEvent.prototype.stop = function () {
	    this.app.on(`render.${this.id}`, null);
	    this.app.on(`materialChanged.${this.id}`, null);
	    this.app.on(`sceneGraphChanged.${this.id}`, null);
	    this.app.on(`cameraChanged.${this.id}`, null);
	};

	RenderEvent.prototype.onRender = function () {
	    var editor = this.app.editor;
	    var sceneHelpers = editor.sceneHelpers;
	    var scene = editor.scene;
	    var camera = editor.camera;
	    var renderer = editor.renderer;

	    sceneHelpers.updateMatrixWorld();
	    scene.updateMatrixWorld();

	    // 渲染场景
	    renderer.render(scene, camera);

	    // if (editor.selected && editor.selected instanceof THREE.Mesh) {
	    //     this.selectEffect.render(editor.selected);
	    // }

	    // // 为选中的Mesh渲染边框
	    // if (editor.selected && editor.selected instanceof THREE.Mesh) {
	    //     var box = new THREE.Mesh(editor.selected.geometry, new THREE.MeshBasicMaterial({
	    //         color: 0xec651a,
	    //         depthTest: false
	    //     }));
	    //     box.position.copy(editor.selected.position);
	    //     box.rotation.copy(editor.selected.rotation);
	    //     box.scale.copy(editor.selected.scale);

	    //     var state = renderer.state;
	    //     var context = renderer.context;

	    //     this.sceneSelected.children.length = 0;
	    //     this.sceneSelected.add(box);

	    //     // 绘制模板
	    //     renderer.clearStencil();
	    //     state.buffers.stencil.setTest(true);
	    //     state.buffers.stencil.setClear(0x00);

	    //     state.buffers.color.setMask(false);
	    //     state.buffers.stencil.setMask(0xff);
	    //     state.buffers.stencil.setFunc(context.ALWAYS, 1, 0xff);

	    //     state.buffers.color.setLocked(true);

	    //     renderer.render(this.sceneSelected, camera);

	    //     state.buffers.color.setLocked(false);
	    //     state.buffers.color.setMask(true);
	    //     state.buffers.stencil.setMask(0x00);

	    //     // 绘制轮廓
	    //     var oldScale = box.scale.clone();
	    //     box.scale.set(oldScale.x * 1.1, oldScale.y * 1.1, oldScale.z * 1.1);

	    //     state.buffers.stencil.setOp(context.KEEP, context.REPLACE, context.REPLACE);
	    //     state.buffers.stencil.setFunc(context.NOTEQUAL, 1, 0xff);

	    //     renderer.render(this.sceneSelected, camera);

	    //     // 恢复原来状态
	    //     box.scale.copy(oldScale);
	    //     state.buffers.stencil.setTest(false);
	    //     state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.REPLACE);
	    // }

	    // 渲染帮助器
	    renderer.render(sceneHelpers, camera);
	};

	/**
	 * 窗口大小改变事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function ResizeEvent(app) {
	    BaseEvent.call(this, app);
	}

	ResizeEvent.prototype = Object.create(BaseEvent.prototype);
	ResizeEvent.prototype.constructor = ResizeEvent;

	ResizeEvent.prototype.start = function () {
	    this.app.on(`resize.${this.id}`, this.onResize.bind(this));
	};

	ResizeEvent.prototype.stop = function () {
	    this.app.on(`resize.${this.id}`, null);
	};

	ResizeEvent.prototype.onResize = function () {
	    var editor = this.app.editor;
	    var container = this.app.viewport.container;
	    var camera = editor.camera;
	    var renderer = editor.renderer;

	    editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
	    editor.DEFAULT_CAMERA.updateProjectionMatrix();

	    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
	    camera.updateProjectionMatrix();

	    renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

	    this.app.call('render', this);
	};

	/**
	 * 菜单事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function MenuEvent(app) {
	    BaseEvent.call(this, app);
	}

	MenuEvent.prototype = Object.create(BaseEvent.prototype);
	MenuEvent.prototype.constructor = MenuEvent;

	MenuEvent.prototype.start = function () {

	};

	MenuEvent.prototype.stop = function () {

	};

	/**
	 * 添加物体命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @constructor
	 */
	function AddObjectCommand(object) {
		Command.call(this);

		this.type = 'AddObjectCommand';

		this.object = object;

		if (object !== undefined) {
			this.name = '添加物体：' + object.name;
		}
	}
	AddObjectCommand.prototype = Object.create(Command.prototype);

	Object.assign(AddObjectCommand.prototype, {
		constructor: AddObjectCommand,

		execute: function () {
			this.editor.addObject(this.object);
			this.editor.select(this.object);
		},

		undo: function () {
			this.editor.removeObject(this.object);
			this.editor.deselect();
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);
			output.object = this.object.toJSON();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.object.object.uuid);

			if (this.object === undefined) {
				var loader = new THREE.ObjectLoader();
				this.object = loader.parse(json.object);
			}
		}
	});

	/**
	 * 添加物理平板
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function AddPhysicsPlaneEvent(app) {
	    MenuEvent.call(this, app);
	}

	AddPhysicsPlaneEvent.prototype = Object.create(MenuEvent.prototype);
	AddPhysicsPlaneEvent.prototype.constructor = AddPhysicsPlaneEvent;

	AddPhysicsPlaneEvent.prototype.start = function () {
	    this.app.on(`mAddPhysicsPlane.${this.id}`, this.onAddPlane.bind(this));
	};

	AddPhysicsPlaneEvent.prototype.stop = function () {
	    this.app.on(`mAddPhysicsPlane.${this.id}`, null);
	};

	AddPhysicsPlaneEvent.prototype.onAddPlane = function () {
	    var pos = new THREE.Vector3(0, -0.5, 0);
	    var quat = new THREE.Quaternion();

	    var ground = this.app.physics.createParalellepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
	    ground.name = '物理平板';
	    ground.castShadow = true;
	    ground.receiveShadow = true;

	    this.app.editor.execute(new AddObjectCommand(ground));

	    var loader = new THREE.TextureLoader();
	    loader.load("assets/textures/grid.png", function (texture) {
	        texture.wrapS = THREE.RepeatWrapping;
	        texture.wrapT = THREE.RepeatWrapping;
	        texture.repeat.set(40, 40);
	        ground.material.map = texture;
	        ground.material.needsUpdate = true;
	    });
	};

	/**
	 * 添加物理墙
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function AddPhysicsWallEvent(app) {
	    MenuEvent.call(this, app);
	}

	AddPhysicsWallEvent.prototype = Object.create(MenuEvent.prototype);
	AddPhysicsWallEvent.prototype.constructor = AddPhysicsWallEvent;

	AddPhysicsWallEvent.prototype.start = function () {
	    this.app.on(`mAddPhysicsWall.${this.id}`, this.onAddWall.bind(this));
	};

	AddPhysicsWallEvent.prototype.stop = function () {
	    this.app.on(`mAddPhysicsWall.${this.id}`, null);
	};

	AddPhysicsWallEvent.prototype.onAddWall = function () {
	    var editor = this.app.editor;

	    var pos = new THREE.Vector3();
	    var quat = new THREE.Quaternion();

	    // Wall
	    var brickMass = 0.5;
	    var brickLength = 1.2;
	    var brickDepth = 0.6;
	    var brickHeight = brickLength * 0.5;
	    var numBricksLength = 6;
	    var numBricksHeight = 8;
	    var z0 = - numBricksLength * brickLength * 0.5;
	    pos.set(0, brickHeight * 0.5, z0);
	    quat.set(0, 0, 0, 1);
	    for (var j = 0; j < numBricksHeight; j++) {
	        var oddRow = (j % 2) == 1;
	        pos.z = z0;
	        if (oddRow) {
	            pos.z -= 0.25 * brickLength;
	        }
	        var nRow = oddRow ? numBricksLength + 1 : numBricksLength;
	        for (var i = 0; i < nRow; i++) {
	            var brickLengthCurrent = brickLength;
	            var brickMassCurrent = brickMass;
	            if (oddRow && (i == 0 || i == nRow - 1)) {
	                brickLengthCurrent *= 0.5;
	                brickMassCurrent *= 0.5;
	            }
	            var color = Math.floor(Math.random() * (1 << 24));
	            var material = new THREE.MeshPhongMaterial({ color: color });
	            var brick = this.app.physics.createParalellepiped(brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, material);
	            brick.castShadow = true;
	            brick.receiveShadow = true;
	            editor.scene.add(brick);

	            if (oddRow && (i == 0 || i == nRow - 2)) {
	                pos.z += 0.75 * brickLength;
	            }
	            else {
	                pos.z += brickLength;
	            }
	        }
	        pos.y += brickHeight;
	    }
	};

	/**
	 * 添加物理布料
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function AddPhysicsClothEvent(app) {
	    MenuEvent.call(this, app);
	}

	AddPhysicsClothEvent.prototype = Object.create(MenuEvent.prototype);
	AddPhysicsClothEvent.prototype.constructor = AddPhysicsClothEvent;

	AddPhysicsClothEvent.prototype.start = function () {
	    this.app.on(`mAddPhysicsCloth.${this.id}`, this.onAddCloth.bind(this));
	};

	AddPhysicsClothEvent.prototype.stop = function () {
	    this.app.on(`mAddPhysicsCloth.${this.id}`, null);
	};

	AddPhysicsClothEvent.prototype.onAddCloth = function () {
	    // The cloth
	    // Cloth graphic object
	    var clothWidth = 4;
	    var clothHeight = 3;
	    var clothNumSegmentsZ = clothWidth * 5;
	    var clothNumSegmentsY = clothHeight * 5;
	    var clothPos = new THREE.Vector3(-3, 3, 2);
	    //var clothGeometry = new THREE.BufferGeometry();
	    var clothGeometry = new THREE.PlaneBufferGeometry(clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY);
	    clothGeometry.rotateY(Math.PI * 0.5);
	    clothGeometry.translate(clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5);
	    //var clothMaterial = new THREE.MeshLambertMaterial( { color: 0x0030A0, side: THREE.DoubleSide } );
	    var clothMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
	    var cloth = new THREE.Mesh(clothGeometry, clothMaterial);
	    cloth.name = '布';
	    cloth.castShadow = true;
	    cloth.receiveShadow = false;

	    this.app.editor.execute(new AddObjectCommand(cloth));

	    new THREE.TextureLoader().load("assets/textures/grid.png", function (texture) {
	        texture.wrapS = THREE.RepeatWrapping;
	        texture.wrapT = THREE.RepeatWrapping;
	        texture.repeat.set(clothNumSegmentsZ, clothNumSegmentsY);
	        cloth.material.map = texture;
	        cloth.material.needsUpdate = true;
	    });
	    // Cloth physic object
	    var softBodyHelpers = new Ammo.btSoftBodyHelpers();
	    var clothCorner00 = new Ammo.btVector3(clothPos.x, clothPos.y + clothHeight, clothPos.z);
	    var clothCorner01 = new Ammo.btVector3(clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth);
	    var clothCorner10 = new Ammo.btVector3(clothPos.x, clothPos.y, clothPos.z);
	    var clothCorner11 = new Ammo.btVector3(clothPos.x, clothPos.y, clothPos.z - clothWidth);
	    var clothSoftBody = softBodyHelpers.CreatePatch(this.app.physics.world.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true);
	    var sbConfig = clothSoftBody.get_m_cfg();
	    sbConfig.set_viterations(10);
	    sbConfig.set_piterations(10);
	    clothSoftBody.setTotalMass(0.9, false);
	    Ammo.castObject(clothSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(this.app.physics.margin * 3);

	    this.app.physics.world.addSoftBody(clothSoftBody, 1, -1);

	    cloth.userData.physicsBody = clothSoftBody;
	    // Disable deactivation
	    clothSoftBody.setActivationState(4);
	    var armLength = 3 + clothWidth;
	    var pylonHeight = clothPos.y + clothHeight;
	    var baseMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
	    var pos = new THREE.Vector3();
	    pos.set(clothPos.x, 0.1, clothPos.z - armLength);
	    var quat = new THREE.Quaternion();
	    quat.set(0, 0, 0, 1);

	    var base = this.app.physics.createParalellepiped(1, 0.2, 1, 0, pos, quat, baseMaterial);
	    base.castShadow = true;
	    base.receiveShadow = true;
	    pos.set(clothPos.x, 0.5 * pylonHeight, clothPos.z - armLength);

	    this.app.editor.execute(new AddObjectCommand(base));

	    var pylon = this.app.physics.createParalellepiped(0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial);
	    pylon.castShadow = true;
	    pylon.receiveShadow = true;
	    pos.set(clothPos.x, pylonHeight + 0.2, clothPos.z - 0.5 * armLength);

	    this.app.editor.execute(new AddObjectCommand(pylon));

	    var arm = this.app.physics.createParalellepiped(0.4, 0.4, armLength + 0.4, 0, pos, quat, baseMaterial);
	    arm.castShadow = true;
	    arm.receiveShadow = true;

	    this.app.editor.execute(new AddObjectCommand(arm));

	    // Glue the cloth to the arm
	    var influence = 0.5;
	    clothSoftBody.appendAnchor(0, arm.userData.physicsBody, false, influence);
	    clothSoftBody.appendAnchor(clothNumSegmentsZ, arm.userData.physicsBody, false, influence);

	    // Hinge constraint to move the arm
	    var pivotA = new Ammo.btVector3(0, pylonHeight * 0.5, 0);
	    var pivotB = new Ammo.btVector3(0, -0.2, - armLength * 0.5);
	    var axis = new Ammo.btVector3(0, 1, 0);
	    var hinge = new Ammo.btHingeConstraint(pylon.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true);
	    this.app.physics.world.addConstraint(hinge, true);

	    this.cloth = cloth;

	    this.app.on(`animate`, this.onAnimate.bind(this));
	};

	AddPhysicsClothEvent.prototype.onAnimate = function (clock, deltaTime) {
	    if (this.cloth == null) {
	        return;
	    }

	    var cloth = this.cloth;

	    // Update cloth
	    var softBody = cloth.userData.physicsBody;
	    var clothPositions = cloth.geometry.attributes.position.array;
	    var numVerts = clothPositions.length / 3;
	    var nodes = softBody.get_m_nodes();
	    var indexFloat = 0;
	    for (var i = 0; i < numVerts; i++) {
	        var node = nodes.at(i);
	        var nodePos = node.get_m_x();
	        clothPositions[indexFloat++] = nodePos.x();
	        clothPositions[indexFloat++] = nodePos.y();
	        clothPositions[indexFloat++] = nodePos.z();
	    }
	    cloth.geometry.computeVertexNormals();
	    cloth.geometry.attributes.position.needsUpdate = true;
	    cloth.geometry.attributes.normal.needsUpdate = true;
	};

	/**
	 * 设置位置命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newPosition THREE.Vector3
	 * @param optionalOldPosition THREE.Vector3
	 * @constructor
	 */
	function SetPositionCommand(object, newPosition, optionalOldPosition) {
		Command.call(this);

		this.type = 'SetPositionCommand';
		this.name = '设置位置';
		this.updatable = true;

		this.object = object;

		if (object !== undefined && newPosition !== undefined) {
			this.oldPosition = object.position.clone();
			this.newPosition = newPosition.clone();
		}

		if (optionalOldPosition !== undefined) {
			this.oldPosition = optionalOldPosition.clone();
		}
	}
	SetPositionCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetPositionCommand.prototype, {
		constructor: SetPositionCommand,

		execute: function () {
			this.object.position.copy(this.newPosition);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		undo: function () {
			this.object.position.copy(this.oldPosition);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		update: function (command) {
			this.newPosition.copy(command.newPosition);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.oldPosition = this.oldPosition.toArray();
			output.newPosition = this.newPosition.toArray();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.oldPosition = new THREE.Vector3().fromArray(json.oldPosition);
			this.newPosition = new THREE.Vector3().fromArray(json.newPosition);
		}
	});

	/**
	 * 设置旋转命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newRotation THREE.Euler
	 * @param optionalOldRotation THREE.Euler
	 * @constructor
	 */
	function SetRotationCommand(object, newRotation, optionalOldRotation) {
		Command.call(this);

		this.type = 'SetRotationCommand';
		this.name = '设置旋转';
		this.updatable = true;

		this.object = object;

		if (object !== undefined && newRotation !== undefined) {
			this.oldRotation = object.rotation.clone();
			this.newRotation = newRotation.clone();
		}

		if (optionalOldRotation !== undefined) {
			this.oldRotation = optionalOldRotation.clone();
		}
	}
	SetRotationCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetRotationCommand.prototype, {
		constructor: SetRotationCommand,

		execute: function () {
			this.object.rotation.copy(this.newRotation);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		undo: function () {
			this.object.rotation.copy(this.oldRotation);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		update: function (command) {
			this.newRotation.copy(command.newRotation);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.oldRotation = this.oldRotation.toArray();
			output.newRotation = this.newRotation.toArray();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.oldRotation = new THREE.Euler().fromArray(json.oldRotation);
			this.newRotation = new THREE.Euler().fromArray(json.newRotation);
		}
	});

	/**
	 * 设置缩放命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newScale THREE.Vector3
	 * @param optionalOldScale THREE.Vector3
	 * @constructor
	 */
	function SetScaleCommand(object, newScale, optionalOldScale) {
		Command.call(this);

		this.type = 'SetScaleCommand';
		this.name = '设置缩放';
		this.updatable = true;

		this.object = object;

		if (object !== undefined && newScale !== undefined) {
			this.oldScale = object.scale.clone();
			this.newScale = newScale.clone();
		}

		if (optionalOldScale !== undefined) {
			this.oldScale = optionalOldScale.clone();
		}
	}
	SetScaleCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetScaleCommand.prototype, {
		constructor: SetScaleCommand,

		execute: function () {
			this.object.scale.copy(this.newScale);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		undo: function () {
			this.object.scale.copy(this.oldScale);
			this.object.updateMatrixWorld(true);
			this.editor.app.call('objectChanged', this, this.object);
		},

		update: function (command) {
			this.newScale.copy(command.newScale);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.oldScale = this.oldScale.toArray();
			output.newScale = this.newScale.toArray();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.oldScale = new THREE.Vector3().fromArray(json.oldScale);
			this.newScale = new THREE.Vector3().fromArray(json.newScale);
		}
	});

	/**
	 * 平移旋转缩放控件事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function TransformControlsEvent(app) {
	    BaseEvent.call(this, app);

	    this.mode = 'translate';

	    this.objectPosition = null;
	    this.objectRotation = null;
	    this.objectScale = null;
	}

	TransformControlsEvent.prototype = Object.create(BaseEvent.prototype);
	TransformControlsEvent.prototype.constructor = TransformControlsEvent;

	TransformControlsEvent.prototype.start = function () {
	    var transformControls = this.app.editor.transformControls;

	    transformControls.addEventListener('change', this.onChange.bind(this));
	    transformControls.addEventListener('mouseDown', this.onMouseDown.bind(this));
	    transformControls.addEventListener('mouseUp', this.onMouseUp.bind(this));

	    this.app.on('objectSelected.' + this.id, this.onObjectSelected.bind(this));
	    this.app.on('changeMode.' + this.id, this.onChangeMode.bind(this));
	    this.app.on('snapChanged.' + this.id, this.onSnapChanged.bind(this));
	    this.app.on('spaceChanged.' + this.id, this.onSpaceChanged.bind(this));
	};

	TransformControlsEvent.prototype.stop = function () {
	    var transformControls = this.app.editor.transformControls;

	    transformControls.removeEventListener('change', this.onChange);
	    transformControls.removeEventListener('mouseDown', this.onMouseDown);
	    transformControls.removeEventListener('mouseUp', this.onMouseUp);

	    this.app.on('changeMode.' + this.id, null);
	    this.app.on('snapChanged.' + this.id, null);
	    this.app.on('spaceChanged.' + this.id, null);
	};

	/**
	 * 控件发生改变，需要更新包围盒位置，重绘场景
	 */
	TransformControlsEvent.prototype.onChange = function () {
	    var editor = this.app.editor;
	    var object = editor.transformControls.object;

	    if (object == null) {
	        this.app.call('render', this);
	        return;
	    }

	    if (editor.helpers[object.id] !== undefined && !(editor.helpers[object.id] instanceof THREE.SkeletonHelper)) {
	        editor.helpers[object.id].update();
	    }

	    this.app.call('objectChanged', this, object);
	    this.app.call('render');
	};

	/**
	 * 点击鼠标，记录选中物体当前平移、旋转和缩放值
	 */
	TransformControlsEvent.prototype.onMouseDown = function () {
	    if (['translate', 'rotate', 'scale'].indexOf(this.mode) === -1) {
	        return;
	    }

	    var object = this.app.editor.transformControls.object;

	    this.objectPosition = object.position.clone();
	    this.objectRotation = object.rotation.clone();
	    this.objectScale = object.scale.clone();

	    this.app.editor.controls.enabled = false; // EditorControls
	};

	/**
	 * 抬起鼠标，更新选中物体的平移、旋转和缩放值
	 */
	TransformControlsEvent.prototype.onMouseUp = function () {
	    if (['translate', 'rotate', 'scale'].indexOf(this.mode) === -1) {
	        return;
	    }

	    var editor = this.app.editor;
	    var transformControls = editor.transformControls;
	    var object = transformControls.object;

	    if (object == null) {
	        return;
	    }

	    switch (transformControls.getMode()) {
	        case 'translate':
	            if (!this.objectPosition.equals(object.position)) {
	                editor.execute(new SetPositionCommand(object, object.position, this.objectPosition));
	            }
	            break;
	        case 'rotate':
	            if (!this.objectRotation.equals(object.rotation)) {
	                editor.execute(new SetRotationCommand(object, object.rotation, this.objectRotation));
	            }
	            break;
	        case 'scale':
	            if (!this.objectScale.equals(object.scale)) {
	                editor.execute(new SetScaleCommand(object, object.scale, this.objectScale));
	            }
	            break;
	    }

	    this.app.editor.controls.enabled = true; // EditorControls
	};

	/**
	 * 物体已经选中
	 * @param {*} object 选中的物体
	 */
	TransformControlsEvent.prototype.onObjectSelected = function (object) {
	    this.app.editor.transformControls.detach();

	    if (['translate', 'rotate', 'scale'].indexOf(this.mode) === -1) {
	        return;
	    }

	    if (object && !(object instanceof THREE.Scene) && !(object instanceof THREE.PerspectiveCamera && object.userData.isDefault === true)) {
	        this.app.editor.transformControls.attach(object);
	    }
	};

	/**
	 * 切换平移、旋转、缩放模式
	 * @param {*} mode 模式
	 */
	TransformControlsEvent.prototype.onChangeMode = function (mode) {
	    this.mode = mode;
	    var transformControls = this.app.editor.transformControls;

	    if (mode === 'translate' || mode === 'rotate' || mode === 'scale') { // 设置模式在选中物体上
	        transformControls.setMode(mode);
	        var object = this.app.editor.selected;
	        if (object != null) {
	            transformControls.attach(object);
	        }
	    } else { // 取消对选中物体平移、旋转、缩放
	        transformControls.detach();
	    }
	};

	/**
	 * 设置平移移动的大小
	 * @param {*} dist 
	 */
	TransformControlsEvent.prototype.onSnapChanged = function (dist) {
	    this.app.editor.transformControls.setTranslationSnap(dist);
	};

	/**
	 * 设置世界坐标系还是物体坐标系
	 * @param {*} space 
	 */
	TransformControlsEvent.prototype.onSpaceChanged = function (space) {
	    this.app.editor.transformControls.setSpace(space);
	};

	/**
	 * 物体事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function ObjectEvent(app) {
	    BaseEvent.call(this, app);
	    this.box = new THREE.Box3();
	}

	ObjectEvent.prototype = Object.create(BaseEvent.prototype);
	ObjectEvent.prototype.constructor = ObjectEvent;

	ObjectEvent.prototype.start = function () {
	    this.app.on('objectAdded.' + this.id, this.onObjectAdded.bind(this));
	    this.app.on('objectChanged.' + this.id, this.onObjectChanged.bind(this));
	    this.app.on('objectRemoved.' + this.id, this.onObjectRemoved.bind(this));
	    this.app.on('objectSelected.' + this.id, this.onObjectSelected.bind(this));
	    this.app.on('objectFocused.' + this.id, this.onObjectFocused.bind(this));
	};

	ObjectEvent.prototype.stop = function () {
	    this.app.on('objectAdded.' + this.id, null);
	    this.app.on('objectChanged.' + this.id, null);
	    this.app.on('objectRemoved.' + this.id, null);
	    this.app.on('objectSelected.' + this.id, null);
	    this.app.on('objectFocused.' + this.id, null);
	};

	ObjectEvent.prototype.onObjectAdded = function (object) {
	    var objects = this.app.editor.objects;

	    object.traverse(function (child) {
	        objects.push(child);
	    });
	};

	ObjectEvent.prototype.onObjectChanged = function (object) {
	    var editor = this.app.editor;
	    var transformControls = editor.transformControls;

	    if (editor.selected === object) {
	        transformControls.update();
	    }

	    if (object instanceof THREE.PerspectiveCamera) {
	        object.updateProjectionMatrix();
	    }

	    if (editor.helpers[object.id] !== undefined && !(editor.helpers[object.id] instanceof THREE.SkeletonHelper)) {
	        editor.helpers[object.id].update();
	    }

	    this.app.call('render');
	};

	ObjectEvent.prototype.onObjectRemoved = function (object) {
	    var objects = this.app.editor.objects;

	    object.traverse(function (child) {
	        objects.splice(objects.indexOf(child), 1);
	    });
	};

	ObjectEvent.prototype.onObjectSelected = function (object) {
	    var editor = this.app.editor;
	    var scene = editor.scene;
	    var box = this.box;

	    this.app.call('render');
	};

	ObjectEvent.prototype.onObjectFocused = function (object) {
	    var controls = this.app.editor.controls;

	    controls.focus(object);
	};

	/**
	 * 选取事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function PickEvent(app) {
	    BaseEvent.call(this, app);

	    this.raycaster = new THREE.Raycaster();
	    this.mouse = new THREE.Vector2();

	    this.onDownPosition = new THREE.Vector2();
	    this.onUpPosition = new THREE.Vector2();
	    this.onDoubleClickPosition = new THREE.Vector2();
	}

	PickEvent.prototype = Object.create(BaseEvent.prototype);
	PickEvent.prototype.constructor = PickEvent;

	PickEvent.prototype.start = function () {
	    var container = this.app.viewport.container;

	    container.dom.addEventListener('mousedown', this.onMouseDown.bind(this), false);
	    container.dom.addEventListener('dblclick', this.onDoubleClick.bind(this), false);
	};

	PickEvent.prototype.stop = function () {
	    var container = this.app.viewport.container;

	    container.dom.removeEventListener('mousedown', this.onMouseDown, false);
	    container.dom.removeEventListener('dblclick', this.onDoubleClick, false);
	};

	PickEvent.prototype.onMouseDown = function (event) {
	    var container = this.app.viewport.container;

	    event.preventDefault();

	    var array = this.getMousePosition(container.dom, event.clientX, event.clientY);
	    this.onDownPosition.fromArray(array);

	    document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
	};

	PickEvent.prototype.onMouseUp = function (event) {
	    var container = this.app.viewport.container;

	    var array = this.getMousePosition(container.dom, event.clientX, event.clientY);
	    this.onUpPosition.fromArray(array);

	    this.handleClick();

	    document.removeEventListener('mouseup', this.onMouseUp, false);
	};

	PickEvent.prototype.onDoubleClick = function (event) {
	    var container = this.app.viewport.container;
	    var objects = this.app.editor.objects;

	    var array = this.getMousePosition(container.dom, event.clientX, event.clientY);
	    this.onDoubleClickPosition.fromArray(array);

	    var intersects = this.getIntersects(this.onDoubleClickPosition, objects);

	    if (intersects.length > 0) {
	        var intersect = intersects[0];
	        this.app.call('objectFocused', this, intersect.object);
	    }
	};

	PickEvent.prototype.getIntersects = function (point, objects) {
	    this.mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
	    this.raycaster.setFromCamera(this.mouse, this.app.editor.camera);
	    return this.raycaster.intersectObjects(objects);
	};

	PickEvent.prototype.getMousePosition = function (dom, x, y) {
	    var rect = dom.getBoundingClientRect();
	    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
	};

	PickEvent.prototype.handleClick = function () {
	    var container = this.app.viewport.container;
	    var editor = this.app.editor;
	    var objects = editor.objects;

	    if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
	        var intersects = this.getIntersects(this.onUpPosition, objects);

	        if (intersects.length > 0) {
	            var object = intersects[0].object;

	            if (object.userData.object !== undefined) {
	                // helper
	                editor.select(object.userData.object);
	            } else {
	                editor.select(object);
	            }
	        } else {
	            editor.select(null);
	        }

	        this.app.call('render');
	    }
	};

	/**
	 * 编辑器控件事件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 
	 */
	function EditorControlsEvent(app) {
	    BaseEvent.call(this, app);
	}

	EditorControlsEvent.prototype = Object.create(BaseEvent.prototype);
	EditorControlsEvent.prototype.constructor = EditorControlsEvent;

	EditorControlsEvent.prototype.start = function () {
	    var controls = this.app.editor.controls;

	    controls.addEventListener('change', this.onChange.bind(this));

	    this.app.on('editorCleared.' + this.id, this.onEditorCleared.bind(this));
	};

	EditorControlsEvent.prototype.stop = function () {
	    var controls = this.app.editor.controls;

	    controls.removeEventListener('change', this.onChange);

	    this.app.on('editorCleared.' + this.id, null);
	};

	EditorControlsEvent.prototype.onChange = function () {
	    var editor = this.app.editor;
	    var transformControls = editor.transformControls;
	    var camera = editor.camera;

	    transformControls.update();

	    this.app.call('cameraChanged', this, camera);
	};

	EditorControlsEvent.prototype.onEditorCleared = function () {
	    var controls = this.app.editor.controls;

	    controls.center.set(0, 0, 0);

	    this.app.call('render');
	};

	/**
	 * 事件执行器
	 * @author tengge / https://github.com/tengge1
	 */
	function EventDispatcher(app) {
	    this.app = app;
	    this.dispatch = dispatch.apply(dispatch, EventList);
	    this.addDomEventListener();

	    this.events = [
	        // 核心事件
	        new AnimateEvent(this.app),
	        new KeyDownEvent(this.app),
	        new RenderEvent(this.app),
	        new ResizeEvent(this.app),

	        // menubar中的事件
	        new AddPhysicsPlaneEvent(this.app),
	        new AddPhysicsWallEvent(this.app),
	        new AddPhysicsClothEvent(this.app),

	        // viewport中的事件
	        new TransformControlsEvent(this.app),
	        new ObjectEvent(this.app),
	        new PickEvent(this.app),
	        new EditorControlsEvent(this.app)
	    ];
	}

	EventDispatcher.prototype = Object.create(BaseEvent.prototype);
	EventDispatcher.prototype.constructor = EventDispatcher;

	/**
	 * 启动
	 */
	EventDispatcher.prototype.start = function () {
	    this.events.forEach(n => {
	        n.start();
	    });
	};

	/**
	 * 停止
	 */
	EventDispatcher.prototype.stop = function () {
	    this.events.forEach(n => {
	        n.stop();
	    });
	};

	/**
	 * 执行事件
	 * @param {*} eventName 
	 * @param {*} _this 
	 * @param {*} others 
	 */
	EventDispatcher.prototype.call = function (eventName, _this, ...others) {
	    this.dispatch.call(eventName, _this, ...others);
	};

	/**
	 * 监听事件
	 * @param {*} eventName 
	 * @param {*} callback 
	 */
	EventDispatcher.prototype.on = function (eventName, callback) {
	    this.dispatch.on(eventName, callback);
	};

	/**
	 * 监听dom事件
	 */
	EventDispatcher.prototype.addDomEventListener = function () {
	    var container = this.app.container;
	    container.addEventListener('click', event => {
	        this.dispatch.call('click', this, event);
	    });
	    container.addEventListener('contextmenu', event => {
	        this.dispatch.call('contextmenu', this, event);
	        event.preventDefault();
	        return false;
	    });
	    container.addEventListener('dblclick', event => {
	        this.dispatch.call('dblclick', this, event);
	    });
	    document.addEventListener('keydown', event => {
	        this.dispatch.call('keydown', this, event);
	    });
	    document.addEventListener('keyup', event => {
	        this.dispatch.call('keyup', this, event);
	    });
	    container.addEventListener('mousedown', event => {
	        this.dispatch.call('mousedown', this, event);
	    });
	    container.addEventListener('mousemove', event => {
	        this.dispatch.call('mousemove', this, event);
	    });
	    container.addEventListener('mouseup', event => {
	        this.dispatch.call('mouseup', this, event);
	    });
	    container.addEventListener('mousewheel', event => {
	        this.dispatch.call('mousewheel', this, event);
	    });
	    window.addEventListener('resize', event => {
	        this.dispatch.call('resize', this, event);
	    }, false);
	    document.addEventListener('dragover', event => {
	        this.dispatch.call('dragover', this, event);
	    }, false);
	    document.addEventListener('drop', event => {
	        this.dispatch.call('drop', this, event);
	    }, false);
	};

	/**
	 * Logo标志
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Logo(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	Logo.prototype = Object.create(UI$1.Control.prototype);
	Logo.prototype.constructor = Logo;

	Logo.prototype.render = function () {

	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'logo',
	        html: '<i class="iconfont icon-shadow"></i>'
	    });

	    container.render();
	};

	/**
	 * 获取MIME-Type后缀名
	 * @param {*} mimeType MIME-Type
	 */
	function getExtension(mimeType) {
	    switch (mimeType) {
	        case 'image/jpeg':
	            return 'jpg';
	        case 'image/png':
	            return 'png';
	        case 'image/gif':
	            return 'gif';
	        case 'image/bmp':
	            return 'bmp';
	        default:
	            console.error(`MIMETypeUtils: 未知MIME-Type类型：${mimeType}`);
	            return 'unknown';
	    }
	}

	/**
	 * 获取MIME-Type类型
	 * @param {*} extension 文件名后缀
	 */
	function getMIMEType(extension) {
	    extension = extension.trimLeft('.');
	    switch (extension.toLowerCase()) {
	        case 'jpg':
	        case 'jpeg':
	            return 'image/jpeg';
	        case 'png':
	            return 'image/png';
	        case 'gif':
	            return 'image/gif';
	        case 'bmp':
	            return 'image/bmp';
	        default:
	            console.warn(`MIMETypeUtils: 未知后缀类型： ${extension}`);
	            return 'application/octet-stream';
	    }
	}

	/**
	 * MIME-Type工具类
	 */
	const MIMETypeUtils = {
	    getExtension: getExtension,
	    getMIMEType: getMIMEType,
	};

	/**
	 * ajax
	 * @author tengge / https://github.com/tengge1
	 * @param {*} params 参数
	 */
	function ajax(params) {
	    const url = params.url || '';
	    const method = params.method || 'GET';
	    const data = params.data || null;
	    const callback = params.callback || null;

	    const xhr = new XMLHttpRequest();
	    xhr.open(method, url, true);
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	            var data = xhr.responseText;
	            typeof (callback) === 'function' && callback(data);
	        }
	    };

	    if (data === null) { // 不需要POST数据
	        xhr.send(null);
	        return;
	    }

	    // 判断是发送表单还是上传文件
	    // 由于API Controller只能序列化Content-Type为`application/x-www-form-urlencoded`的数据，所以发送表单和上传文件只能二选一。
	    // 否则报错："No MediaTypeFormatter is available to read an object of type 'EditTextureModel' from content with media type 'multipart/form-data'.
	    var hasFile = false;

	    for (var name in data) {
	        if (data[name] instanceof Blob) {
	            hasFile = true;
	            break;
	        }
	    }

	    if (hasFile) { // 上传文件
	        var formData = new FormData();

	        for (var name in data) {
	            if (data[name] instanceof Blob) {
	                formData.append(name, data[name], `${data[name].name}.${MIMETypeUtils.getExtension(data[name].type)}`);
	            }
	        }

	        xhr.send(formData);
	    } else { // 发送表单
	        var bodies = [];
	        for (var name in data) {
	            bodies.push(name + '=' + encodeURIComponent(data[name]));
	        }

	        var body = bodies.join('&');
	        if (body.length) {
	            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	        }

	        xhr.send(body);
	    }
	}

	/**
	 * get请求
	 * @param {*} url 地址
	 * @param {*} callback 回调函数
	 */
	function get$1(url, callback) {
	    ajax({
	        url: url,
	        callback: callback
	    });
	}

	/**
	 * get请求并解析json数据
	 * @param {*} url 
	 * @param {*} callback 
	 */
	function getJson(url, callback) {
	    ajax({
	        url: url,
	        callback: function (data) {
	            typeof (callback) === 'function' && callback(JSON.parse(data));
	        }
	    });
	}

	/**
	 * post请求
	 * @param {*} url 地址
	 * @param {*} data 数据
	 * @param {*} callback 回调函数
	 */
	function post(url, data, callback) {
	    const _data = typeof (data) === 'function' ? null : data;
	    const _callback = typeof (data) === 'function' ? data : callback;

	    ajax({
	        url: url,
	        method: 'POST',
	        data: _data,
	        callback: _callback
	    });
	}

	/**
	 * Ajax
	 */
	const Ajax = {
	    ajax: ajax,
	    get: get$1,
	    getJson: getJson,
	    post: post
	};

	/**
	 * 场景序列化信息
	 * @author tengge / https://github.com/tengge1
	 */
	var Metadata = {
	    generator: 'ShadowEditor',
	    type: 'Object',
	    version: '0.0.1'
	};

	var ID$3 = -1;

	/**
	 * 序列化器基类
	 * @author tengge / https://github.com/tengge1
	 */
	function BaseSerializer() {
	    this.id = 'BaseSerializer' + ID$3--;
	    this.metadata = Object.assign({}, Metadata, {
	        generator: this.constructor.name
	    });
	}

	/**
	 *对象转json
	 * @param {*} obj 对象
	 */
	BaseSerializer.prototype.toJSON = function (obj) {
	    var json = {
	        metadata: this.metadata
	    };
	    return json;
	};

	/**
	 * json转对象
	 * @param {*} json json对象
	 * @param {*} parent 父对象
	 */
	BaseSerializer.prototype.fromJSON = function (json, parent) {
	    if (parent) {
	        return parent;
	    }

	    return {};
	};

	/**
	 * Object3DSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function Object3DSerializer() {
	    BaseSerializer.call(this);
	}

	Object3DSerializer.prototype = Object.create(BaseSerializer.prototype);
	Object3DSerializer.prototype.constructor = Object3DSerializer;

	Object3DSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.castShadow = obj.castShadow;
	    json.children = obj.children.map(child => {
	        return child.uuid;
	    });
	    json.frustumCulled = obj.frustumCulled;
	    json.layers = obj.layers;
	    json.matrix = obj.matrix;
	    json.matrixAutoUpdate = obj.matrixAutoUpdate;
	    json.matrixWorld = obj.matrixWorld;
	    json.matrixWorldNeedsUpdate = obj.matrixWorldNeedsUpdate;
	    json.modelViewMatrix = obj.modelViewMatrix;
	    json.name = obj.name;
	    json.normalMatrix = obj.normalMatrix;
	    json.parent = obj.parent == null ? null : obj.parent.uuid;
	    json.position = obj.position;
	    json.quaternion = {
	        x: obj.quaternion.x,
	        y: obj.quaternion.y,
	        z: obj.quaternion.z,
	        w: obj.quaternion.w
	    };
	    json.receiveShadow = obj.receiveShadow;
	    json.renderOrder = obj.renderOrder;
	    json.rotation = {
	        x: obj.rotation.x,
	        y: obj.rotation.y,
	        z: obj.rotation.z,
	        order: obj.rotation.order
	    };
	    json.scale = obj.scale;
	    json.type = obj.type;
	    json.up = obj.up;

	    json.userData = {};
	    Object.assign(json.userData, obj.userData);

	    json.uuid = obj.uuid;
	    json.visible = obj.visible;
	    json.isObject3D = obj.isObject3D;

	    return json;
	};

	Object3DSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? THREE.Object3D : parent;

	    BaseSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.castShadow = json.castShadow;
	    obj.frustumCulled = json.frustumCulled;
	    obj.type = json.type;
	    obj.uuid = json.uuid;

	    obj.matrix.copy(json.matrix);
	    obj.matrixAutoUpdate = json.matrixAutoUpdate;
	    obj.name = json.name;
	    obj.position.copy(json.position);
	    obj.quaternion.copy(json.quaternion);
	    obj.receiveShadow = json.receiveShadow;
	    obj.renderOrder = json.renderOrder;
	    obj.rotation.set(json.rotation.x, json.rotation.y, json.rotation.z, json.rotation.order);
	    obj.scale.copy(json.scale);
	    obj.up.copy(json.up);
	    obj.visible = json.visible;
	    Object.assign(obj.userData, json.userData);

	    return obj;
	};

	/**
	 * 产生一个单像素画布
	 * @param {*} color 默认颜色
	 */
	function onePixelCanvas(color = '#000000') {
	    var canvas = document.createElement('canvas');
	    canvas.width = 1;
	    canvas.height = 1;
	    var ctx = canvas.getContext('2d');
	    ctx.fillStyle = color;
	    ctx.fillRect(0, 0, 1, 1);
	    return canvas;
	}

	/**
	 * 图片工具类
	 */
	const ImageUtils = {
	    onePixelCanvas: onePixelCanvas
	};

	/**
	 * TextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TextureSerializer() {
	    BaseSerializer.call(this);
	}

	TextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	TextureSerializer.prototype.constructor = TextureSerializer;

	TextureSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.anisotropy = obj.anisotropy;
	    json.center = obj.center;
	    json.encoding = obj.encoding;
	    json.flipY = obj.flipY;
	    json.format = obj.format;
	    json.generateMipmaps = obj.generateMipmaps;

	    // 说明：立体贴图obj.image是一个图片数组。
	    if (obj.image && !Array.isArray(obj.image) && obj.image.tagName.toLowerCase() === 'img') { // 图片
	        json.image = {
	            tagName: 'img',
	            src: obj.image.src,
	            width: obj.image.width,
	            height: obj.image.height
	        };
	    } else if (obj.image && !Array.isArray(obj.image) && obj.image.tagName.toLowerCase() === 'canvas') { // 画布
	        json.image = {
	            tagName: 'canvas',
	            src: obj.image.toDataURL(),
	            width: obj.image.width,
	            height: obj.image.height
	        };
	    } else {
	        json.image = null;
	    }

	    json.magFilter = obj.magFilter;
	    json.mapping = obj.mapping;
	    json.matrix = obj.matrix;
	    json.matrixAutoUpdate = obj.matrixAutoUpdate;
	    json.minFilter = obj.minFilter;
	    json.mipmaps = obj.mipmaps;
	    json.name = obj.name;
	    json.offset = obj.offset;
	    json.premultiplyAlpha = obj.premultiplyAlpha;
	    json.repeat = obj.repeat;
	    json.rotation = obj.rotation;
	    json.type = obj.type;
	    json.unpackAlignment = obj.unpackAlignment;
	    json.uuid = obj.uuid;
	    json.version = obj.version;
	    json.wrapS = obj.wrapS;
	    json.wrapT = obj.wrapT;
	    json.isTexture = obj.isTexture;
	    json.needsUpdate = obj.needsUpdate;

	    return json;
	};

	TextureSerializer.prototype.fromJSON = function (json, parent) {
	    // 用一个像素的图片初始化Texture，避免图片载入前的警告信息。
	    var img = ImageUtils.onePixelCanvas();
	    var obj = parent === undefined ? new THREE.Texture(img) : parent;

	    obj.anisotropy = json.anisotropy;
	    obj.center.copy(json.center);
	    obj.encoding = json.encoding;
	    obj.flipY = json.flipY;
	    obj.format = json.format;
	    obj.generateMipmaps = json.generateMipmaps;

	    if (json.image && !Array.isArray(json.image) && json.image.tagName === 'img') { // 图片
	        var img = document.createElement('img');
	        img.src = json.image.src;
	        img.width = json.image.width;
	        img.height = json.image.height;
	        img.onload = function () {
	            obj.image = img;
	            obj.needsUpdate = true;
	        };
	    } else if (json.image && !Array.isArray(obj.image) && json.image.tagName === 'canvas') { // 画布
	        var canvas = document.createElement('canvas');
	        canvas.width = 256;
	        canvas.height = 256;
	        var ctx = canvas.getContext('2d');

	        var img = document.createElement('img');
	        img.src = json.image.src;
	        img.onload = function () {
	            canvas.width = img.width;
	            canvas.height = img.height;
	            ctx.drawImage(img, 0, 0);

	            obj.needsUpdate = true;
	        };

	        obj.image = canvas;
	    }

	    obj.magFilter = json.magFilter;
	    obj.mapping = json.mapping;
	    obj.matrix.copy(json.matrix);
	    obj.matrixAutoUpdate = json.matrixAutoUpdate;
	    obj.minFilter = json.minFilter;
	    obj.mipmaps = json.mipmaps;
	    obj.name = json.name;
	    obj.offset.copy(json.offset);
	    obj.premultiplyAlpha = json.premultiplyAlpha;
	    obj.repeat.copy(json.repeat);
	    obj.rotation = json.rotation;
	    obj.type = json.type;
	    obj.unpackAlignment = json.unpackAlignment;
	    obj.uuid = json.uuid;
	    obj.version = json.version;
	    obj.wrapS = json.wrapS;
	    obj.wrapT = json.wrapT;
	    obj.isTexture = json.isTexture;
	    obj.needsUpdate = true;

	    return obj;
	};

	/**
	 * CanvasTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CanvasTextureSerializer() {
	    BaseSerializer.call(this);
	}

	CanvasTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	CanvasTextureSerializer.prototype.constructor = CanvasTextureSerializer;

	CanvasTextureSerializer.prototype.toJSON = function (obj) {
	    return TextureSerializer.prototype.toJSON.call(this, obj);
	};

	CanvasTextureSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.CanvasTexture() : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * CompressedTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CompressedTextureSerializer() {
	    BaseSerializer.call(this);
	}

	CompressedTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	CompressedTextureSerializer.prototype.constructor = CompressedTextureSerializer;

	CompressedTextureSerializer.prototype.toJSON = function (obj) {
	    return TextureSerializer.prototype.toJSON.call(this, obj);
	};

	CompressedTextureSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.CompressedTexture() : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * CubeTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CubeTextureSerializer() {
	    BaseSerializer.call(this);
	}

	CubeTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	CubeTextureSerializer.prototype.constructor = CubeTextureSerializer;

	CubeTextureSerializer.prototype.toJSON = function (obj) {
	    var json = TextureSerializer.prototype.toJSON.call(this, obj);

	    json.image = [];

	    obj.image.forEach(n => {
	        json.image.push({
	            tagName: 'img',
	            src: n.src,
	            width: n.width,
	            height: n.height
	        });
	    });

	    return json;
	};

	CubeTextureSerializer.prototype.fromJSON = function (json, parent) {
	    // 用一个像素的图片初始化CubeTexture，避免图片载入前的警告信息。
	    var img = ImageUtils.onePixelCanvas();
	    var obj = parent === undefined ? new THREE.CubeTexture([img, img, img, img, img, img]) : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    if (Array.isArray(json.image)) {
	        var promises = json.image.map(n => {
	            return new Promise(resolve => {
	                var img = document.createElement('img');
	                img.src = n.src;
	                img.width = n.width;
	                img.height = n.height;
	                img.onload = () => {
	                    resolve(img);
	                };
	            });
	        });
	        Promise.all(promises).then(imgs => {
	            obj.image = imgs;
	            obj.needsUpdate = true;
	        });
	    }

	    return obj;
	};

	/**
	 * DataTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function DataTextureSerializer() {
	    BaseSerializer.call(this);
	}

	DataTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	DataTextureSerializer.prototype.constructor = DataTextureSerializer;

	DataTextureSerializer.prototype.toJSON = function (obj) {
	    return TextureSerializer.prototype.toJSON.call(this, obj);
	};

	DataTextureSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.DataTexture() : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * DepthTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function DepthTextureSerializer() {
	    BaseSerializer.call(this);
	}

	DepthTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	DepthTextureSerializer.prototype.constructor = DepthTextureSerializer;

	DepthTextureSerializer.prototype.toJSON = function (obj) {
	    return TextureSerializer.prototype.toJSON.call(this, obj);
	};

	DepthTextureSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.DataTexture() : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * VideoTextureSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function VideoTextureSerializer() {
	    BaseSerializer.call(this);
	}

	VideoTextureSerializer.prototype = Object.create(BaseSerializer.prototype);
	VideoTextureSerializer.prototype.constructor = VideoTextureSerializer;

	VideoTextureSerializer.prototype.toJSON = function (obj) {
	    return TextureSerializer.prototype.toJSON.call(this, obj);
	};

	VideoTextureSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.VideoTexture() : parent;

	    TextureSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	var Serializers = {
	    'CanvasTexture': CanvasTextureSerializer,
	    'CompressedTexture': CompressedTextureSerializer,
	    'CubeTexture': CubeTextureSerializer,
	    'DataTexture': DataTextureSerializer,
	    'DepthTexture': DepthTextureSerializer,
	    'VideoTexture': VideoTextureSerializer,
	    'Texture': TextureSerializer
	};

	/**
	 * TexturesSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TexturesSerializer() {
	    BaseSerializer.call(this);
	}

	TexturesSerializer.prototype = Object.create(BaseSerializer.prototype);
	TexturesSerializer.prototype.constructor = TexturesSerializer;

	TexturesSerializer.prototype.toJSON = function (obj) {
	    var serializer = Serializers[obj.constructor.name];

	    if (serializer === undefined) {
	        console.warn(`TexturesSerializer: 无法序列化${obj.type}。`);
	        return null;
	    }

	    return (new serializer()).toJSON(obj);
	};

	TexturesSerializer.prototype.fromJSON = function (json, parent) {
	    var generator = json.metadata.generator;

	    var serializer = Serializers[generator.replace('Serializer', '')];

	    if (serializer === undefined) {
	        console.warn(`TexturesSerializer: 不存在 ${generator} 的反序列化器`);
	        return null;
	    }

	    return (new serializer()).fromJSON(json, parent);
	};

	/**
	 * MaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MaterialSerializer.prototype.constructor = MaterialSerializer;

	MaterialSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.alphaMap = obj.alphaMap == null ? null : (new TexturesSerializer()).toJSON(obj.alphaMap);
	    json.alphaTest = obj.alphaTest;
	    json.aoMap = obj.aoMap == null ? null : (new TexturesSerializer()).toJSON(obj.aoMap);
	    json.aoMapIntensity = obj.aoMapIntensity;
	    json.blendDst = obj.blendDst;
	    json.blendDstAlpha = obj.blendDstAlpha;
	    json.blendEquation = obj.blendEquation;
	    json.blendEquationAlpha = obj.blendEquationAlpha;
	    json.blendSrc = obj.blendSrc;
	    json.blendSrcAlpha = obj.blendSrcAlpha;
	    json.blending = obj.blending;
	    json.bumpMap = obj.bumpMap == null ? null : (new TexturesSerializer()).toJSON(obj.bumpMap);
	    json.bumpScale = obj.bumpScale;
	    json.clipIntersection = obj.clipIntersection;
	    json.clipShadow = obj.clipShadow;
	    json.clippingPlanes = obj.clippingPlanes;
	    json.color = obj.color;
	    json.colorWrite = obj.colorWrite;
	    json.depthFunc = obj.depthFunc;
	    json.depthTest = obj.depthTest;
	    json.depthWrite = obj.depthWrite;
	    json.displacementBias = obj.displacementBias;
	    json.displacementMap = obj.displacementMap == null ? null : (new TexturesSerializer()).toJSON(obj.displacementMap);
	    json.displacementScale = obj.displacementScale;
	    json.dithering = obj.dithering;
	    json.emissive = obj.emissive;
	    json.emissiveIntensity = obj.emissiveIntensity;
	    json.emissiveMap = obj.emissiveMap == null ? null : (new TexturesSerializer()).toJSON(obj.emissiveMap);
	    json.envMap = obj.envMap == null ? null : (new TexturesSerializer()).toJSON(obj.envMap);
	    json.envMapIntensity = obj.envMapIntensity;
	    json.flatShading = obj.flatShading;
	    json.fog = obj.fog;
	    json.lightMap = obj.lightMap == null ? null : (new TexturesSerializer()).toJSON(obj.lightMap);
	    json.lightMapIntensity = obj.lightMapIntensity;
	    json.lights = obj.lights;
	    json.linewidth = obj.linewidth;
	    json.map = obj.map == null ? null : (new TexturesSerializer()).toJSON(obj.map);
	    json.metalness = obj.metalness;
	    json.metalnessMap = obj.metalnessMap == null ? null : (new TexturesSerializer()).toJSON(obj.metalnessMap);
	    json.morphNormals = obj.morphNormals;
	    json.morphTargets = obj.morphTargets;
	    json.name = obj.name;
	    json.normalMap = obj.normalMap == null ? null : (new TexturesSerializer()).toJSON(obj.normalMap);
	    json.normalScale = obj.normalScale;
	    json.opacity = obj.opacity;
	    json.overdraw = obj.overdraw;
	    json.polygonOffset = obj.polygonOffset;
	    json.polygonOffsetFactor = obj.polygonOffsetFactor;
	    json.polygonOffsetUnits = obj.polygonOffsetUnits;
	    json.precision = obj.precision;
	    json.premultipliedAlpha = obj.premultipliedAlpha;
	    json.refractionRatio = obj.refractionRatio;
	    json.roughness = obj.roughness;
	    json.roughnessMap = obj.roughnessMap == null ? null : (new TexturesSerializer()).toJSON(obj.roughnessMap);
	    json.shadowSide = obj.shadowSide;
	    json.side = obj.side;
	    json.skinning = obj.skinning;
	    json.transparent = obj.transparent;
	    json.type = obj.type;
	    json.userData = obj.userData;
	    json.uuid = obj.uuid;
	    json.vertexColors = obj.vertexColors;
	    json.visible = obj.visible;
	    json.wireframe = obj.wireframe;
	    json.wireframeLinecap = obj.wireframeLinecap;
	    json.wireframeLinejoin = obj.wireframeLinejoin;
	    json.wireframeLinewidth = obj.wireframeLinewidth;

	    return json;
	};

	MaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Material() : parent;

	    obj.alphaMap = json.alphaMap == null ? null : (new TexturesSerializer()).fromJSON(json.alphaMap);
	    obj.alphaTest = json.alphaTest;
	    obj.aoMap = json.aoMap == null ? null : (new TexturesSerializer()).fromJSON(json.aoMap);
	    obj.aoMapIntensity = json.aoMapIntensity;
	    obj.blendDst = json.blendDst;
	    obj.blendDstAlpha = json.blendDstAlpha;
	    obj.blendEquation = json.blendEquation;
	    obj.blendEquationAlpha = json.blendEquationAlpha;
	    obj.blendSrc = json.blendSrc;
	    obj.blendSrcAlpha = json.blendSrcAlpha;
	    obj.blending = json.blending;
	    obj.bumpMap = json.bumpMap == null ? null : (new TexturesSerializer()).fromJSON(json.bumpMap);
	    obj.bumpScale = json.bumpScale;
	    obj.clipIntersection = json.clipIntersection;
	    obj.clipShadow = json.clipShadow;
	    obj.clippingPlanes = json.clippingPlanes;
	    obj.color = json.color == null ? null : new THREE.Color(json.color);
	    obj.colorWrite = json.colorWrite;
	    obj.depthFunc = json.depthFunc;
	    obj.depthTest = json.depthTest;
	    obj.depthWrite = json.depthWrite;
	    obj.displacementBias = json.displacementBias;
	    obj.displacementMap = json.displacementMap == null ? null : (new TexturesSerializer()).fromJSON(json.displacementMap);
	    obj.displacementScale = json.displacementScale;
	    obj.dithering = json.dithering;
	    obj.emissive = json.emissive == null ? undefined : new THREE.Color(json.emissive);
	    obj.emissiveIntensity = json.emissiveIntensity;
	    obj.emissiveMap = json.emissiveMap == null ? null : (new TexturesSerializer()).fromJSON(json.emissiveMap);
	    obj.envMap = json.envMap == null ? null : (new TexturesSerializer()).fromJSON(json.envMap);
	    obj.envMapIntensity = json.envMapIntensity;
	    obj.flatShading = json.flatShading;
	    obj.fog = json.fog;
	    obj.lightMap = json.lightMap == null ? null : (new TexturesSerializer()).fromJSON(json.lightMap);
	    obj.lightMapIntensity = json.lightMapIntensity;
	    obj.lights = json.lights;
	    obj.linewidth = json.linewidth;
	    obj.map = json.map == null ? null : (new TexturesSerializer()).fromJSON(json.map);
	    obj.metalness = json.metalness;
	    obj.metalnessMap = json.metalnessMap == null ? null : (new TexturesSerializer()).fromJSON(json.metalnessMap);
	    obj.morphNormals = json.morphNormals;
	    obj.morphTargets = json.morphTargets;
	    obj.name = json.name;
	    obj.normalMap = json.normalMap == null ? null : (new TexturesSerializer()).fromJSON(json.normalMap);
	    obj.normalScale = json.normalScale == null ? null : new THREE.Vector2().copy(json.normalScale);
	    obj.opacity = json.opacity;
	    obj.overdraw = json.overdraw;
	    obj.polygonOffset = json.polygonOffset;
	    obj.polygonOffsetFactor = json.polygonOffsetFactor;
	    obj.polygonOffsetUnits = json.polygonOffsetUnits;
	    obj.precision = json.precision;
	    obj.premultipliedAlpha = json.premultipliedAlpha;
	    obj.refractionRatio = json.refractionRatio;
	    obj.roughness = json.roughness;
	    obj.roughnessMap = json.roughnessMap == null ? null : (new TexturesSerializer()).fromJSON(json.roughnessMap);
	    obj.shadowSide = json.shadowSide;
	    obj.side = json.side;
	    obj.skinning = json.skinning;
	    obj.transparent = json.transparent;
	    obj.type = json.type;
	    obj.userData = json.userData;
	    obj.uuid = json.uuid;
	    obj.vertexColors = json.vertexColors;
	    obj.visible = json.visible;
	    obj.wireframe = json.wireframe;
	    obj.wireframeLinecap = json.wireframeLinecap;
	    obj.wireframeLinejoin = json.wireframeLinejoin;
	    obj.wireframeLinewidth = json.wireframeLinewidth;

	    return obj;
	};

	/**
	 * LineBasicMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LineBasicMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	LineBasicMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	LineBasicMaterialSerializer.prototype.constructor = LineBasicMaterialSerializer;

	LineBasicMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	LineBasicMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.LineBasicMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * LineDashedMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LineDashedMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	LineDashedMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	LineDashedMaterialSerializer.prototype.constructor = LineDashedMaterialSerializer;

	LineDashedMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	LineDashedMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.LineDashedMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshBasicMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshBasicMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshBasicMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshBasicMaterialSerializer.prototype.constructor = MeshBasicMaterialSerializer;

	MeshBasicMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshBasicMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshBasicMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshDepthMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshDepthMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshDepthMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshDepthMaterialSerializer.prototype.constructor = MeshDepthMaterialSerializer;

	MeshDepthMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshDepthMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshDepthMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshDistanceMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshDistanceMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshDistanceMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshDistanceMaterialSerializer.prototype.constructor = MeshDistanceMaterialSerializer;

	MeshDistanceMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshDistanceMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshDistanceMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshFaceMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshFaceMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshFaceMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshFaceMaterialSerializer.prototype.constructor = MeshFaceMaterialSerializer;

	MeshFaceMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshFaceMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshFaceMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshLambertMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshLambertMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshLambertMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshLambertMaterialSerializer.prototype.constructor = MeshLambertMaterialSerializer;

	MeshLambertMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshLambertMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshLambertMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshNormalMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshNormalMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshNormalMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshNormalMaterialSerializer.prototype.constructor = MeshNormalMaterialSerializer;

	MeshNormalMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshNormalMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshNormalMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshPhongMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshPhongMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshPhongMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshPhongMaterialSerializer.prototype.constructor = MeshPhongMaterialSerializer;

	MeshPhongMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshPhongMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshPhongMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshPhysicalMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshPhysicalMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshPhysicalMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshPhysicalMaterialSerializer.prototype.constructor = MeshPhysicalMaterialSerializer;

	MeshPhysicalMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshPhysicalMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshPhysicalMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshStandardMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshStandardMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshStandardMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshStandardMaterialSerializer.prototype.constructor = MeshStandardMaterialSerializer;

	MeshStandardMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshStandardMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshStandardMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MeshToonMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshToonMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MeshToonMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshToonMaterialSerializer.prototype.constructor = MeshToonMaterialSerializer;

	MeshToonMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MeshToonMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MeshToonMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * MultiMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MultiMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	MultiMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	MultiMaterialSerializer.prototype.constructor = MultiMaterialSerializer;

	MultiMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	MultiMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.MultiMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ParticleBasicMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ParticleBasicMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	ParticleBasicMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	ParticleBasicMaterialSerializer.prototype.constructor = ParticleBasicMaterialSerializer;

	ParticleBasicMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	ParticleBasicMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ParticleBasicMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ParticleSystemMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ParticleSystemMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	ParticleSystemMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	ParticleSystemMaterialSerializer.prototype.constructor = ParticleSystemMaterialSerializer;

	ParticleSystemMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	ParticleSystemMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ParticleSystemMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * PointCloudMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PointCloudMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	PointCloudMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	PointCloudMaterialSerializer.prototype.constructor = PointCloudMaterialSerializer;

	PointCloudMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	PointCloudMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PointCloudMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * PointsMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PointsMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	PointsMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	PointsMaterialSerializer.prototype.constructor = PointsMaterialSerializer;

	PointsMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	PointsMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PointsMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * RawShaderMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function RawShaderMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	RawShaderMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	RawShaderMaterialSerializer.prototype.constructor = RawShaderMaterialSerializer;

	RawShaderMaterialSerializer.prototype.toJSON = function (obj) {
	    var json = MaterialSerializer.prototype.toJSON.call(this, obj);

	    json.defines = obj.defines;

	    json.uniforms = {};

	    for (var i in obj.uniforms) {
	        var uniform = obj.uniforms[i];
	        if (uniform.value instanceof THREE.Color) {
	            json.uniforms[i] = {
	                type: 'color',
	                value: uniform.value
	            };
	        } else {
	            json.uniforms[i] = {
	                value: uniform.value
	            };
	        }
	    }

	    json.vertexShader = obj.vertexShader;
	    json.fragmentShader = obj.fragmentShader;

	    return json;
	};

	RawShaderMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.RawShaderMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.defines = json.defines;

	    obj.uniforms = {};

	    for (var i in json.uniforms) {
	        var uniform = json.uniforms[i];
	        if (uniform.type === 'color') {
	            obj.uniforms[i] = {
	                value: new THREE.Color(uniform.value)
	            };
	        } else {
	            obj.uniforms[i] = {
	                value: uniform.value
	            };
	        }
	    }

	    obj.vertexShader = json.vertexShader;
	    obj.fragmentShader = json.fragmentShader;

	    return obj;
	};

	/**
	 * ShaderMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ShaderMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	ShaderMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	ShaderMaterialSerializer.prototype.constructor = ShaderMaterialSerializer;

	ShaderMaterialSerializer.prototype.toJSON = function (obj) {
	    var json = MaterialSerializer.prototype.toJSON.call(this, obj);

	    json.defines = obj.defines;

	    json.uniforms = {};

	    for (var i in obj.uniforms) {
	        var uniform = obj.uniforms[i];
	        if (uniform.value instanceof THREE.Color) {
	            json.uniforms[i] = {
	                type: 'color',
	                value: uniform.value
	            };
	        } else {
	            json.uniforms[i] = {
	                value: uniform.value
	            };
	        }
	    }

	    json.vertexShader = obj.vertexShader;
	    json.fragmentShader = obj.fragmentShader;

	    return json;
	};

	ShaderMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ShaderMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.defines = json.defines;

	    obj.uniforms = {};

	    for (var i in json.uniforms) {
	        var uniform = json.uniforms[i];
	        if (uniform.type === 'color') {
	            obj.uniforms[i] = {
	                value: new THREE.Color(uniform.value)
	            };
	        } else {
	            obj.uniforms[i] = {
	                value: uniform.value
	            };
	        }
	    }

	    obj.vertexShader = json.vertexShader;
	    obj.fragmentShader = json.fragmentShader;

	    return obj;
	};

	/**
	 * ShadowMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ShadowMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	ShadowMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	ShadowMaterialSerializer.prototype.constructor = ShadowMaterialSerializer;

	ShadowMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	ShadowMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ShadowMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * SpriteCanvasMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SpriteCanvasMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	SpriteCanvasMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	SpriteCanvasMaterialSerializer.prototype.constructor = SpriteCanvasMaterialSerializer;

	SpriteCanvasMaterialSerializer.prototype.toJSON = function (obj) {
	    return MaterialSerializer.prototype.toJSON.call(this, obj);
	};

	SpriteCanvasMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.SpriteCanvasMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * SpriteMaterialSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SpriteMaterialSerializer() {
	    BaseSerializer.call(this);
	}

	SpriteMaterialSerializer.prototype = Object.create(BaseSerializer.prototype);
	SpriteMaterialSerializer.prototype.constructor = SpriteMaterialSerializer;

	SpriteMaterialSerializer.prototype.toJSON = function (obj) {
	    var json = MaterialSerializer.prototype.toJSON.call(this, obj);
	    json.isSpriteMaterial = true;
	    return json;
	};

	SpriteMaterialSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.SpriteMaterial() : parent;

	    MaterialSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	var Serializers$1 = {
	    'LineBasicMaterial': LineBasicMaterialSerializer,
	    'LineDashedMaterial': LineDashedMaterialSerializer,
	    'MeshBasicMaterial': MeshBasicMaterialSerializer,
	    'MeshDepthMaterial': MeshDepthMaterialSerializer,
	    'MeshDistanceMaterial': MeshDistanceMaterialSerializer,
	    'MeshFaceMaterial': MeshFaceMaterialSerializer,
	    'MeshLambertMaterial': MeshLambertMaterialSerializer,
	    'MeshNormalMaterial': MeshNormalMaterialSerializer,
	    'MeshPhongMaterial': MeshPhongMaterialSerializer,
	    'MeshPhysicalMaterial': MeshPhysicalMaterialSerializer,
	    'MeshStandardMaterial': MeshStandardMaterialSerializer,
	    'MeshToonMaterial': MeshToonMaterialSerializer,
	    'MultiMaterial': MultiMaterialSerializer,
	    'ParticleBasicMaterial': ParticleBasicMaterialSerializer,
	    'ParticleSystemMaterial': ParticleSystemMaterialSerializer,
	    'PointCloudMaterial': PointCloudMaterialSerializer,
	    'PointsMaterial': PointsMaterialSerializer,
	    'RawShaderMaterial': RawShaderMaterialSerializer,
	    'ShaderMaterial': ShaderMaterialSerializer,
	    'ShadowMaterial': ShadowMaterialSerializer,
	    'SpriteCanvasMaterial': SpriteCanvasMaterialSerializer,
	    'SpriteMaterial': SpriteMaterialSerializer
	};

	/**
	 * MaterialsSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MaterialsSerializer() {
	    BaseSerializer.call(this);
	}

	MaterialsSerializer.prototype = Object.create(BaseSerializer.prototype);
	MaterialsSerializer.prototype.constructor = MaterialsSerializer;

	MaterialsSerializer.prototype.toJSON = function (obj) {
	    var serializer = Serializers$1[obj.type];

	    if (serializer === undefined) {
	        console.warn(`MaterialsSerializer: 无法序列化${obj.type}。`);
	        return null;
	    }

	    return (new serializer()).toJSON(obj);
	};

	MaterialsSerializer.prototype.fromJSON = function (json, parent) {
	    var generator = json.metadata.generator;

	    var serializer = Serializers$1[generator.replace('Serializer', '')];

	    if (serializer === undefined) {
	        console.warn(`MaterialsSerializer: 不存在 ${generator} 的反序列化器。`);
	        return null;
	    }

	    return (new serializer()).fromJSON(json, parent);
	};

	/**
	 * SceneSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SceneSerializer() {
	    BaseSerializer.call(this);
	}

	SceneSerializer.prototype = Object.create(BaseSerializer.prototype);
	SceneSerializer.prototype.constructor = SceneSerializer;

	SceneSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    if (obj.background instanceof THREE.Texture) { // 天空盒和背景图片
	        json.background = new TexturesSerializer().toJSON(obj.background);
	    } else { // 纯色
	        json.background = obj.background;
	    }

	    json.fog = obj.fog;
	    json.overrideMaterial = obj.overrideMaterial == null ? null : (new MaterialsSerializer()).toJSON(obj.overrideMaterial);

	    return json;
	};

	SceneSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Scene() : parent;

	    Object3DSerializer.prototype.fromJSON(json, obj);

	    if (json.background.metadata &&
	        (json.background.metadata.generator === 'CubeTextureSerializer' ||
	            json.background.metadata.generator === 'TextureSerializer')
	    ) { // 天空盒和背景图片
	        obj.background = new TexturesSerializer().fromJSON(json.background);
	    } else { // 纯色
	        obj.background = new THREE.Color(json.background);
	    }

	    if (json.fog && (json.fog.type === 'Fog' || json.fog instanceof THREE.Fog)) {
	        obj.fog = new THREE.Fog(json.fog.color, json.fog.near, json.fog.far);
	    } else if (json.fog && (json.fog.type === 'FogExp2' || json.fog instanceof THREE.FogExp2)) {
	        obj.fog = new THREE.FogExp2(json.fog.color, json.fog.density);
	    } else if (json.fog) {
	        console.warn(`SceneSerializer: unknown fog type ${json.fog.type}.`);
	    }

	    obj.overrideMaterial = json.overrideMaterial == null ? null : (new MaterialsSerializer()).fromJSON(json.overrideMaterial);

	    return obj;
	};

	/**
	 * BufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function BufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	BufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	BufferGeometrySerializer.prototype.constructor = BufferGeometrySerializer;

	BufferGeometrySerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    // json.attributes太大，不要保存在Mongo
	    // json.attributes = obj.attributes;
	    json.boundingBox = obj.boundingBox;
	    json.boundingSphere = obj.boundingSphere;
	    json.drawRange = obj.drawRange;
	    json.groups = obj.groups;
	    // json.index = obj.index;
	    json.morphAttributes = obj.morphAttributes;
	    json.name = obj.name;
	    json.parameters = obj.parameters;
	    json.type = obj.type;
	    json.userData = obj.userData;
	    json.uuid = obj.uuid;

	    return json;
	};

	BufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.BufferGeometry() : parent;

	    BaseSerializer.prototype.fromJSON.call(this, json, obj);

	    // obj.attributes = json.attributes;
	    // if (json.boundingBox) {
	    //     obj.boundingBox = new THREE.Box3(
	    //         new THREE.Vector3().copy(json.boundingBox.min),
	    //         new THREE.Vector3().copy(json.boundingBox.max),
	    //     );
	    // }

	    // if (json.boundingSphere) {
	    //     obj.boundingSphere = new THREE.Sphere(
	    //         new THREE.Vector3().copy(json.boundingSphere.center),
	    //         json.boundingSphere.radius
	    //     );
	    // }

	    // if (json.drawRange) {
	    //     obj.drawRange.start = json.drawRange.start;
	    //     obj.drawRange.count = json.drawRange.count === null ? Infinity : json.drawRange.count;
	    // }

	    obj.groups = json.groups;
	    // obj.index = json.index;
	    obj.morphAttributes = json.morphAttributes;
	    obj.name = json.name;
	    obj.parameters = json.parameters;
	    obj.type = json.type;
	    obj.userData = json.userData;
	    obj.uuid = json.uuid;

	    return obj;
	};

	/**
	 * BoxBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function BoxBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	BoxBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	BoxBufferGeometrySerializer.prototype.constructor = BoxBufferGeometrySerializer;

	BoxBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	BoxBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.BoxBufferGeometry(
	        json.parameters.width,
	        json.parameters.height,
	        json.parameters.depth,
	        json.parameters.widthSegments,
	        json.parameters.heightSegments,
	        json.parameters.depthSegments
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * CircleBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CircleBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	CircleBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	CircleBufferGeometrySerializer.prototype.constructor = CircleBufferGeometrySerializer;

	CircleBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	CircleBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.CircleBufferGeometry(
	        json.parameters.radius,
	        json.parameters.segments,
	        json.parameters.thetaStart,
	        json.parameters.thetaLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ConeBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ConeBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	ConeBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	ConeBufferGeometrySerializer.prototype.constructor = ConeBufferGeometrySerializer;

	ConeBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	ConeBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ConeBufferGeometry(
	        json.parameters.radius,
	        json.parameters.height,
	        json.parameters.radialSegments,
	        json.parameters.heightSegments,
	        json.parameters.openEnded,
	        json.parameters.thetaStart,
	        json.parameters.thetaLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * CylinderBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CylinderBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	CylinderBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	CylinderBufferGeometrySerializer.prototype.constructor = CylinderBufferGeometrySerializer;

	CylinderBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	CylinderBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.CylinderBufferGeometry(
	        json.parameters.radiusTop,
	        json.parameters.radiusBottom,
	        json.parameters.height,
	        json.parameters.radialSegments,
	        json.parameters.heightSegments,
	        json.parameters.openEnded,
	        json.parameters.thetaStart,
	        json.parameters.thetaLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * DodecahedronBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function DodecahedronBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	DodecahedronBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	DodecahedronBufferGeometrySerializer.prototype.constructor = DodecahedronBufferGeometrySerializer;

	DodecahedronBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	DodecahedronBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.DodecahedronBufferGeometry(
	        json.parameters.radius,
	        json.parameters.detail
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ExtrudeBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ExtrudeBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	ExtrudeBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	ExtrudeBufferGeometrySerializer.prototype.constructor = ExtrudeBufferGeometrySerializer;

	ExtrudeBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	ExtrudeBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    // TODO

	    var obj = parent === undefined ? new THREE.ExtrudeBufferGeometry(
	        json.parameters.shapes,
	        json.parameters.options
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * IcosahedronBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function IcosahedronBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	IcosahedronBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	IcosahedronBufferGeometrySerializer.prototype.constructor = IcosahedronBufferGeometrySerializer;

	IcosahedronBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	IcosahedronBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.IcosahedronBufferGeometry(
	        json.parameters.radius,
	        json.parameters.detail
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * InstancedBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function InstancedBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	InstancedBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	InstancedBufferGeometrySerializer.prototype.constructor = InstancedBufferGeometrySerializer;

	InstancedBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	InstancedBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.InstancedBufferGeometry() : parent;

	    // TODO: 

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * LatheBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LatheBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	LatheBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	LatheBufferGeometrySerializer.prototype.constructor = LatheBufferGeometrySerializer;

	LatheBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	LatheBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.LatheBufferGeometry(
	        json.parameters.points,
	        json.parameters.segments,
	        json.parameters.phiStart,
	        json.parameters.phiLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * OctahedronBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function OctahedronBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	OctahedronBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	OctahedronBufferGeometrySerializer.prototype.constructor = OctahedronBufferGeometrySerializer;

	OctahedronBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	OctahedronBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.OctahedronBufferGeometry(
	        json.parameters.radius,
	        json.parameters.detail
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ParametricBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ParametricBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	ParametricBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	ParametricBufferGeometrySerializer.prototype.constructor = ParametricBufferGeometrySerializer;

	ParametricBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	ParametricBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ParametricBufferGeometry(
	        json.parameters.func,
	        json.parameters.slices,
	        json.parameters.stacks
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * PlaneBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PlaneBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	PlaneBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	PlaneBufferGeometrySerializer.prototype.constructor = PlaneBufferGeometrySerializer;

	PlaneBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	PlaneBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PlaneBufferGeometry(
	        json.parameters.width,
	        json.parameters.height,
	        json.parameters.widthSegments,
	        json.parameters.heightSegments
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * PolyhedronBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PolyhedronBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	PolyhedronBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	PolyhedronBufferGeometrySerializer.prototype.constructor = PolyhedronBufferGeometrySerializer;

	PolyhedronBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	PolyhedronBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PolyhedronBufferGeometry(
	        json.parameters.vertices,
	        json.parameters.indices,
	        json.parameters.radius,
	        json.parameters.detail
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * RingBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function RingBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	RingBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	RingBufferGeometrySerializer.prototype.constructor = RingBufferGeometrySerializer;

	RingBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	RingBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.RingBufferGeometry(
	        json.parameters.innerRadius,
	        json.parameters.outerRadius,
	        json.parameters.thetaSegments,
	        json.parameters.phiSegments,
	        json.parameters.thetaStart,
	        json.parameters.thetaLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * ShapeBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ShapeBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	ShapeBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	ShapeBufferGeometrySerializer.prototype.constructor = ShapeBufferGeometrySerializer;

	ShapeBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	ShapeBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.ShapeBufferGeometry(
	        json.parameters.shapes,
	        json.parameters.curveSegments
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * SphereBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SphereBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	SphereBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	SphereBufferGeometrySerializer.prototype.constructor = SphereBufferGeometrySerializer;

	SphereBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	SphereBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.SphereBufferGeometry(
	        json.parameters.radius,
	        json.parameters.widthSegments,
	        json.parameters.heightSegments,
	        json.parameters.phiStart,
	        json.parameters.phiLength,
	        json.parameters.thetaStart,
	        json.parameters.thetaLength
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TeapotBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TeapotBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TeapotBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TeapotBufferGeometrySerializer.prototype.constructor = TeapotBufferGeometrySerializer;

	TeapotBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TeapotBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TeapotBufferGeometry(
	        json.parameters.size,
	        json.parameters.segments,
	        json.parameters.bottom,
	        json.parameters.lid,
	        json.parameters.body,
	        json.parameters.fitLid,
	        json.parameters.blinn
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TetrahedronBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TetrahedronBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TetrahedronBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TetrahedronBufferGeometrySerializer.prototype.constructor = TetrahedronBufferGeometrySerializer;

	TetrahedronBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TetrahedronBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TetrahedronBufferGeometry(
	        json.parameters.radius,
	        json.parameters.detail
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TextBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TextBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TextBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TextBufferGeometrySerializer.prototype.constructor = TextBufferGeometrySerializer;

	TextBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TextBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TextBufferGeometry(
	        json.parameters.text,
	        json.parameters.parameters
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TorusBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TorusBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TorusBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TorusBufferGeometrySerializer.prototype.constructor = TorusBufferGeometrySerializer;

	TorusBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TorusBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TorusBufferGeometry(
	        json.parameters.radius,
	        json.parameters.tube,
	        json.parameters.radialSegments,
	        json.parameters.tubularSegments,
	        json.parameters.arc
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TorusKnotBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TorusKnotBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TorusKnotBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TorusKnotBufferGeometrySerializer.prototype.constructor = TorusKnotBufferGeometrySerializer;

	TorusKnotBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TorusKnotBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TorusKnotBufferGeometry(
	        json.parameters.radius,
	        json.parameters.tube,
	        json.parameters.tubularSegments,
	        json.parameters.radialSegments,
	        json.parameters.p,
	        json.parameters.q
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * TubeBufferGeometrySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function TubeBufferGeometrySerializer() {
	    BaseSerializer.call(this);
	}

	TubeBufferGeometrySerializer.prototype = Object.create(BaseSerializer.prototype);
	TubeBufferGeometrySerializer.prototype.constructor = TubeBufferGeometrySerializer;

	TubeBufferGeometrySerializer.prototype.toJSON = function (obj) {
	    return BufferGeometrySerializer.prototype.toJSON.call(this, obj);
	};

	TubeBufferGeometrySerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.TubeBufferGeometry(
	        json.parameters.path,
	        json.parameters.tubularSegments,
	        json.parameters.radius,
	        json.parameters.radialSegments,
	        json.parameters.closed
	    ) : parent;

	    BufferGeometrySerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	var Serializers$2 = {
	    'BoxBufferGeometry': BoxBufferGeometrySerializer,
	    'CircleBufferGeometry': CircleBufferGeometrySerializer,
	    'ConeBufferGeometry': ConeBufferGeometrySerializer,
	    'CylinderBufferGeometry': CylinderBufferGeometrySerializer,
	    'DodecahedronBufferGeometry': DodecahedronBufferGeometrySerializer,
	    'ExtrudeBufferGeometry': ExtrudeBufferGeometrySerializer,
	    'IcosahedronBufferGeometry': IcosahedronBufferGeometrySerializer,
	    'InstancedBufferGeometry': InstancedBufferGeometrySerializer,
	    'LatheBufferGeometry': LatheBufferGeometrySerializer,
	    'OctahedronBufferGeometry': OctahedronBufferGeometrySerializer,
	    'ParametricBufferGeometry': ParametricBufferGeometrySerializer,
	    'PlaneBufferGeometry': PlaneBufferGeometrySerializer,
	    'PolyhedronBufferGeometry': PolyhedronBufferGeometrySerializer,
	    'RingBufferGeometry': RingBufferGeometrySerializer,
	    'ShapeBufferGeometry': ShapeBufferGeometrySerializer,
	    'SphereBufferGeometry': SphereBufferGeometrySerializer,
	    'TeapotBufferGeometry': TeapotBufferGeometrySerializer,
	    'TetrahedronBufferGeometry': TetrahedronBufferGeometrySerializer,
	    'TextBufferGeometry': TextBufferGeometrySerializer,
	    'TorusBufferGeometry': TorusBufferGeometrySerializer,
	    'TorusKnotBufferGeometry': TorusKnotBufferGeometrySerializer,
	    'TubeBufferGeometry': TubeBufferGeometrySerializer
	};

	/**
	 * GeometriesSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function GeometriesSerializer() {
	    BaseSerializer.call(this);
	}

	GeometriesSerializer.prototype = Object.create(BaseSerializer.prototype);
	GeometriesSerializer.prototype.constructor = GeometriesSerializer;

	GeometriesSerializer.prototype.toJSON = function (obj) {
	    var serializer = Serializers$2[obj.type];

	    if (serializer === undefined) {
	        console.warn(`GeometriesSerializer: 无法序列化 ${obj.type}。`);
	        return null;
	    }

	    return (new serializer()).toJSON(obj);
	};

	GeometriesSerializer.prototype.fromJSON = function (json, parent) {
	    var generator = json.metadata.generator;

	    var serializer = Serializers$2[generator.replace('Serializer', '')];

	    if (serializer === undefined) {
	        console.warn(`GeometriesSerializer: 不存在 ${generator} 的反序列化器`);
	        return null;
	    }

	    return (new serializer()).fromJSON(json, parent);
	};

	/**
	 * MeshSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function MeshSerializer() {
	    BaseSerializer.call(this);
	}

	MeshSerializer.prototype = Object.create(BaseSerializer.prototype);
	MeshSerializer.prototype.constructor = MeshSerializer;

	MeshSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.drawMode = obj.drawMode;
	    json.geometry = (new GeometriesSerializer()).toJSON(obj.geometry);
	    json.material = (new MaterialsSerializer()).toJSON(obj.material);

	    return json;
	};

	MeshSerializer.prototype.fromJSON = function (json, parent) {
	    // 子类创建模型
	    if (parent !== undefined) {
	        var obj = parent;
	        Object3DSerializer.prototype.fromJSON.call(this, json, obj);
	        return obj;
	    }

	    // 其他模型
	    if (json.geometry == null) {
	        console.warn(`MeshSerializer: ${json.name} json.geometry未定义。`);
	        return null;
	    }
	    if (json.material == null) {
	        console.warn(`MeshSerializer: ${json.name} json.material未定义。`);
	        return null;
	    }

	    var geometry = (new GeometriesSerializer()).fromJSON(json.geometry);
	    var material = (new MaterialsSerializer()).fromJSON(json.material);

	    var obj = new THREE.Mesh(geometry, material);

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * GroupSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function GroupSerializer() {
	    BaseSerializer.call(this);
	}

	GroupSerializer.prototype = Object.create(BaseSerializer.prototype);
	GroupSerializer.prototype.constructor = GroupSerializer;

	GroupSerializer.prototype.toJSON = function (obj) {
	    return Object3DSerializer.prototype.toJSON.call(this, obj);
	};

	GroupSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Group() : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * BoneSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function BoneSerializer() {
	    BaseSerializer.call(this);
	}

	BoneSerializer.prototype = Object.create(BaseSerializer.prototype);
	BoneSerializer.prototype.constructor = BoneSerializer;

	BoneSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    return json;
	};

	BoneSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Bone() : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * SpriteSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SpriteSerializer() {
	    BaseSerializer.call(this);
	}

	SpriteSerializer.prototype = Object.create(BaseSerializer.prototype);
	SpriteSerializer.prototype.constructor = SpriteSerializer;

	SpriteSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.center = obj.center;
	    json.material = (new MaterialsSerializer()).toJSON(obj.material);
	    json.z = obj.z;
	    json.isSprite = obj.isSprite;

	    return json;
	};

	SpriteSerializer.prototype.fromJSON = function (json, parent) {
	    var material;

	    if (parent === undefined) {
	        if (json.material == null) {
	            console.warn(`SpriteSerializer: ${json.name} json.material未定义。`);
	            return null;
	        }
	        material = (new MaterialsSerializer()).fromJSON(json.material);
	    }

	    var obj = parent === undefined ? new THREE.Sprite(material) : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.center.copy(json.center);
	    obj.z = json.z;

	    return obj;
	};

	var ID$4 = -1;

	/**
	 * BaseLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function BaseLoader() {
	    this.id = `BaseLoader${ID$4--}`;
	}

	BaseLoader.prototype.load = function (url, options) {
	    return new Promise(resolve => {
	        resolve(null);
	    });
	};

	/**
	 * AMFLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function AMFLoader() {
	    BaseLoader.call(this);
	}

	AMFLoader.prototype = Object.create(BaseLoader.prototype);
	AMFLoader.prototype.constructor = AMFLoader;

	AMFLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.AMFLoader();
	        loader.load(url, (group) => {
	            resolve(group);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * AWDLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function AWDLoader() {
	    BaseLoader.call(this);
	}

	AWDLoader.prototype = Object.create(BaseLoader.prototype);
	AWDLoader.prototype.constructor = AWDLoader;

	AWDLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.AWDLoader();

	        loader.load(url, (obj3d) => {
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * BabylonLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function BabylonLoader() {
	    BaseLoader.call(this);
	}

	BabylonLoader.prototype = Object.create(BaseLoader.prototype);
	BabylonLoader.prototype.constructor = BabylonLoader;

	BabylonLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.BabylonLoader();

	        loader.load(url, (scene) => {
	            var obj3d = new THREE.Object3D();
	            obj3d.children = scene.children;
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * BinaryLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function BinaryLoader() {
	    BaseLoader.call(this);
	}

	BinaryLoader.prototype = Object.create(BaseLoader.prototype);
	BinaryLoader.prototype.constructor = BinaryLoader;

	BinaryLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.BinaryLoader();

	        loader.load(url, (geometry, materials) => {
	            var mesh = new THREE.Mesh(geometry, materials);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * ColladaLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function ColladaLoader() {
	    BaseLoader.call(this);
	}

	ColladaLoader.prototype = Object.create(BaseLoader.prototype);
	ColladaLoader.prototype.constructor = ColladaLoader;

	ColladaLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.ColladaLoader();

	        loader.load(url, collada => {
	            var obj3d = collada.scene;
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * CTMLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function CTMLoader() {
	    BaseLoader.call(this);
	}

	CTMLoader.prototype = Object.create(BaseLoader.prototype);
	CTMLoader.prototype.constructor = CTMLoader;

	CTMLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.CTMLoader();

	        loader.load(url, geometry => {
	            var material = new THREE.MeshStandardMaterial();
	            var mesh = new THREE.Mesh(geometry, material);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * FBXLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function FBXLoader() {
	    BaseLoader.call(this);
	}

	FBXLoader.prototype = Object.create(BaseLoader.prototype);
	FBXLoader.prototype.constructor = FBXLoader;

	FBXLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.FBXLoader();

	        loader.load(url, obj3d => {
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * GLTFLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function GLTFLoader() {
	    BaseLoader.call(this);
	}

	GLTFLoader.prototype = Object.create(BaseLoader.prototype);
	GLTFLoader.prototype.constructor = GLTFLoader;

	GLTFLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.GLTFLoader();

	        loader.load(url, result => {
	            var obj3d = result.scene;
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * KMZLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function KMZLoader() {
	    BaseLoader.call(this);
	}

	KMZLoader.prototype = Object.create(BaseLoader.prototype);
	KMZLoader.prototype.constructor = KMZLoader;

	KMZLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.KMZLoader();

	        loader.load(url, collada => {
	            var obj3d = collada.scene;
	            resolve(obj3d);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * MD2Loader
	 * @author tengge / https://github.com/tengge1
	 */
	function MD2Loader() {
	    BaseLoader.call(this);
	}

	MD2Loader.prototype = Object.create(BaseLoader.prototype);
	MD2Loader.prototype.constructor = MD2Loader;

	MD2Loader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.MD2Loader();

	        loader.load(url, geometry => {
	            var material = new THREE.MeshStandardMaterial({
	                morphTargets: true,
	                morphNormals: true
	            });

	            var mesh = new THREE.Mesh(geometry, material);
	            mesh.mixer = new THREE.AnimationMixer(mesh);

	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * ObjectLoader（json文件加载器）
	 * @author tengge / https://github.com/tengge1
	 */
	function ObjectLoader() {
	    BaseLoader.call(this);
	}

	ObjectLoader.prototype = Object.create(BaseLoader.prototype);
	ObjectLoader.prototype.constructor = ObjectLoader;

	ObjectLoader.prototype.load = function (url, options) {
	    return new Promise(resolve => {
	        var loader = new THREE.ObjectLoader();

	        loader.load(url, obj => {
	            if (obj instanceof THREE.Scene && obj.children.length > 0 && obj.children[0] instanceof THREE.SkinnedMesh) {
	                resolve(this.loadSkinnedMesh(obj, options));
	            } else {
	                resolve(obj);
	            }
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	ObjectLoader.prototype.loadSkinnedMesh = function (scene, options) {
	    var mesh = null;

	    scene.traverse(child => {
	        if (child instanceof THREE.SkinnedMesh) {
	            mesh = child;
	        }
	    });

	    var animations = mesh.geometry.animations;

	    if (options.Name && animations && animations.length > 0) {

	        var names = animations.map(n => n.name);

	        var source1 = `var mesh = this.getObjectByName('${options.Name}');\nvar mixer = new THREE.AnimationMixer(mesh);\n\n`;

	        var source2 = ``;

	        names.forEach(n => {
	            source2 += `var ${n}Animation = mixer.clipAction('${n}');\n`;
	        });

	        var source3 = `\n${names[0]}Animation.play();\n\n`;

	        var source4 = `function update(clock, deltaTime) { \n    mixer.update(deltaTime); \n}`;

	        var source = source1 + source2 + source3 + source4;

	        mesh.userData.scripts = [{
	            id: null,
	            name: `${options.Name}动画`,
	            type: 'javascript',
	            source: source,
	            uuid: THREE.Math.generateUUID()
	        }];
	    }

	    return mesh;
	};

	/**
	 * OBJLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function OBJLoader() {
	    BaseLoader.call(this);
	}

	OBJLoader.prototype = Object.create(BaseLoader.prototype);
	OBJLoader.prototype.constructor = OBJLoader;

	OBJLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.OBJLoader();

	        loader.load(url, obj => {
	            resolve(obj);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * PLYLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function PLYLoader() {
	    BaseLoader.call(this);
	}

	PLYLoader.prototype = Object.create(BaseLoader.prototype);
	PLYLoader.prototype.constructor = PLYLoader;

	PLYLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.PLYLoader();

	        loader.load(url, geometry => {
	            var material = new THREE.MeshStandardMaterial();
	            var mesh = new THREE.Mesh(geometry, material);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * STLLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function STLLoader() {
	    BaseLoader.call(this);
	}

	STLLoader.prototype = Object.create(BaseLoader.prototype);
	STLLoader.prototype.constructor = STLLoader;

	STLLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.STLLoader();

	        loader.load(url, geometry => {
	            var material = new THREE.MeshStandardMaterial();
	            var mesh = new THREE.Mesh(geometry, material);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * VTKLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function VTKLoader() {
	    BaseLoader.call(this);
	}

	VTKLoader.prototype = Object.create(BaseLoader.prototype);
	VTKLoader.prototype.constructor = VTKLoader;

	VTKLoader.prototype.load = function (url) {
	    return new Promise(resolve => {
	        var loader = new THREE.VTKLoader();

	        loader.load(url, geometry => {
	            var material = new THREE.MeshStandardMaterial();
	            var mesh = new THREE.Mesh(geometry, material);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function DataView2(buffer) {
	    this.buffer = new DataView(buffer);
	    this.position = 0;
	}
	DataView2.prototype.getBool = function () {
	    var v = this.buffer.getUint8(this.position) != 0;
	    this.position += 1;
	    return v
	};

	DataView2.prototype.getUint8 = function () {
	    var v = this.buffer.getUint8(this.position);
	    this.position += 1;
	    return v
	};

	DataView2.prototype.getInt8 = function () {
	    var v = this.buffer.getInt8(this.position);
	    this.position += 1;
	    return v
	};

	DataView2.prototype.getUint16 = function () {
	    var v = this.buffer.getUint16(this.position, true);
	    this.position += 2;
	    return v
	};

	DataView2.prototype.getInt16 = function () {
	    var v = this.buffer.getInt16(this.position, true);
	    this.position += 2;
	    return v
	};

	DataView2.prototype.getUint32 = function () {
	    var v = this.buffer.getUint32(this.position, true);
	    this.position += 4;
	    return v
	};

	DataView2.prototype.getInt32 = function () {
	    var v = this.buffer.getInt32(this.position, true);
	    this.position += 4;
	    return v
	};

	DataView2.prototype.getFloat = function () {
	    var v = this.buffer.getFloat32(this.position, true);
	    this.position += 4;
	    return v
	};

	DataView2.prototype.getString = function (len) {
	    if (len === undefined) len = this.getUint16();
	    var str = "";
	    for (var i = 0; i < len; ++i) {
	        str += String.fromCharCode(this.getUint8());
	    }
	    return str
	};

	DataView2.prototype.setBool = function (v) {
	    this.buffer.setUint8(this.position, v ? 1 : 0);
	    this.position += 1;
	};

	DataView2.prototype.setUint8 = function (v) {
	    this.buffer.setUint8(this.position, v);
	    this.position += 1;
	};

	DataView2.prototype.setInt8 = function (v) {
	    this.buffer.setInt8(this.position, v);
	    this.position += 1;
	};

	DataView2.prototype.setUint16 = function (v) {
	    this.buffer.setUint16(this.position, v, true);
	    this.position += 2;
	};

	DataView2.prototype.setInt16 = function (v) {
	    this.buffer.setInt16(this.position, v, true);
	    this.position += 2;
	};

	DataView2.prototype.setUint32 = function (v) {
	    this.buffer.setUint32(this.position, v, true);
	    this.position += 4;
	};

	DataView2.prototype.setInt32 = function (v) {
	    this.buffer.setInt32(this.position, v, true);
	    this.position += 4;
	};

	DataView2.prototype.setFloat = function (v) {
	    this.buffer.setFloat32(this.position, v, true);
	    this.position += 4;
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function Vertex(r) {
	    var self = this,
	        i;
	    self.position = [r.getFloat(), r.getFloat(), r.getFloat()];
	    self.normal = [r.getFloat(), r.getFloat(), r.getFloat(), 0];
	    self.u = r.getFloat();
	    self.v = r.getFloat();
	    self.bones = new Array(4);
	    for (i = 0; i < 4; ++i) {
	        self.bones[i] = r.getUint8();
	    }
	    self.weights = new Array(4);
	    for (i = 0; i < 4; ++i) {
	        self.weights[i] = r.getFloat();
	    }
	}

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function Texture$1(model, url) {
	    var self = this;
	    self.model = model;
	    self.url = url;
	    self.texture = null;
	    self.load();
	}
	Texture$1.prototype.load = function () {
	    var self = this;

	    self.texture = new THREE.TextureLoader().load(self.url, function (texture) {
	        self.onLoad.call(self, texture);
	    });
	};

	Texture$1.prototype.onLoad = function (texture) {
	    var self = this;
	    texture.flipY = false;
	    self.model.material.map = texture;
	    self.model.material.needsUpdate = true;

	    self.model.dispatch.call('loadTexture');
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function Bone(model, index, r) {
	    var self = this,
	        i;
	    self.model = model;
	    self.index = index;
	    self.name = r.getString().toLowerCase();
	    self.parent = r.getInt32();
	    self.scale = r.getFloat();
	    self.origMatrix = mat4.create();
	    for (i = 0; i < 16; ++i) self.origMatrix[i] = r.getFloat();
	    self.baseMatrix = mat4.clone(self.origMatrix);
	    mat4.transpose(self.baseMatrix, self.baseMatrix);
	    mat4.invert(self.baseMatrix, self.baseMatrix);
	    mat4.transpose(self.origMatrix, self.origMatrix);
	    self.incrMatrix = mat4.create();
	    if (model.version >= 2) {
	        for (i = 0; i < 16; ++i) self.incrMatrix[i] = r.getFloat();
	        mat4.transpose(self.incrMatrix, self.incrMatrix);
	    } else {
	        mat4.identity(self.incrMatrix);
	    }
	}

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	var HiddenBones = {
	    12: {
	        9: {
	            recall: {},
	            all: {
	                recall_chair: true
	            }
	        },
	        10: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        11: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        12: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        13: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        14: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        15: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        16: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        17: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        },
	        18: {
	            recall: {
	                cowbell: true,
	                stick: true
	            },
	            dancein: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            danceloop: {
	                cata_root: true,
	                catb_root: true,
	                catc_root: true,
	                cork: true,
	                bowl: true,
	                bowl_milk: true,
	                milk_root: true,
	                bottle: true
	            },
	            all: {}
	        }
	    },
	    21: {
	        9: {
	            all: {
	                orange: true
	            },
	            recall: {
	                l_weapon: true,
	                r_weapon: true
	            }
	        },
	        10: {
	            recall: {},
	            all: {
	                tv_joint: true,
	                tv_rabit_ears_joints: true
	            }
	        },
	        11: {
	            recall: {},
	            all: {
	                tv_joint: true,
	                tv_rabit_ears_joints: true
	            }
	        },
	        12: {
	            recall: {},
	            all: {
	                tv_joint: true,
	                tv_rabit_ears_joints: true
	            }
	        },
	        13: {
	            recall: {},
	            all: {
	                tv_joint: true,
	                tv_rabit_ears_joints: true
	            }
	        },
	        14: {
	            recall: {},
	            all: {
	                tv_joint: true,
	                tv_rabit_ears_joints: true
	            }
	        }
	    },
	    22: {
	        8: {
	            all: {
	                c_drone_base: true
	            },
	            joke: {},
	            dance: {}
	        }
	    },
	    36: {
	        9: {
	            all: {
	                recall_chair: true
	            },
	            recall: {}
	        }
	    },
	    41: {
	        0: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        1: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        2: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        3: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        4: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        5: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        6: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        },
	        7: {
	            all: {
	                orange1: true,
	                orange2: true,
	                orange3: true
	            },
	            joke: {}
	        }
	    },
	    44: {
	        4: {
	            all: {
	                jacket: true
	            },
	            dance: {
	                jacket: true,
	                weapon: true
	            },
	            recall: {
	                weapon: true
	            }
	        }
	    },
	    55: {
	        7: {
	            recall: {},
	            all: {
	                xmas_pole_skin07: true
	            }
	        }
	    },
	    61: {
	        7: {
	            recall: {},
	            all: {
	                planet1: true,
	                planet2: true,
	                planet3: true,
	                planet4: true,
	                planet5: true,
	                planet6: true
	            }
	        }
	    },
	    69: {
	        4: {
	            all: {
	                l_fan: true,
	                r_fan: true
	            },
	            recall: {}
	        }
	    },
	    80: {
	        8: {
	            all: {
	                oven: true
	            },
	            recall: {}
	        }
	    },
	    83: {
	        0: {
	            all: {},
	            idle2: {
	                weapon: true
	            }
	        },
	        1: {
	            all: {},
	            idle2: {
	                weapon: true
	            }
	        },
	        2: {
	            all: {},
	            idle2: {
	                weapon: true
	            }
	        }
	    },
	    103: {
	        7: {
	            recall: {},
	            all: {
	                arcade: true
	            }
	        }
	    },
	    114: {
	        5: {
	            all: {
	                weapon_krab: true,
	                root_krab: true
	            },
	            recall: {}
	        }
	    },
	    115: {
	        4: {
	            all: {
	                sled: true
	            },
	            satcheljump: {
	                bomb: true,
	                bomb_b: true
	            }
	        }
	    },
	    119: {
	        4: {
	            all: {
	                chair_root: true,
	                sun_reflector_root: true
	            },
	            recall: {}
	        }
	    },
	    136: {
	        0: {
	            all: {
	                shades_sunglass: true
	            },
	            joke: {}
	        },
	        1: {
	            all: {
	                shades_sunglass: true
	            },
	            joke: {}
	        }
	    },
	    143: {
	        4: {
	            attack1: {
	                r_wing: true,
	                l_wing: true
	            },
	            attack2: {
	                r_wing: true,
	                l_wing: true
	            },
	            dance: {
	                r_wing: true,
	                l_wing: true
	            },
	            idle1: {
	                r_wing: true,
	                l_wing: true
	            },
	            idle3: {
	                r_wing: true,
	                l_wing: true
	            },
	            idle4: {
	                r_wing: true,
	                l_wing: true
	            },
	            laugh: {
	                r_wing: true,
	                l_wing: true
	            },
	            run: {
	                r_wing: true,
	                l_wing: true
	            },
	            spell2: {
	                r_wing: true,
	                l_wing: true
	            },
	            all: {}
	        }
	    },
	    157: {
	        4: {
	            all: {
	                flute: true
	            },
	            dance: {}
	        },
	        5: {
	            all: {
	                flute: true
	            },
	            dance: {}
	        },
	        6: {
	            all: {
	                flute: true
	            },
	            dance: {}
	        },
	        7: {
	            all: {
	                flute: true
	            },
	            dance: {}
	        },
	        8: {
	            all: {
	                flute: true
	            },
	            dance: {}
	        }
	    },
	    201: {
	        3: {
	            all: {
	                poro: true
	            }
	        }
	    },
	    222: {
	        4: {
	            all: {
	                rocket_launcher: true
	            },
	            r_attack1: {},
	            r_attack2: {},
	            r_idle1: {},
	            r_idle_in: {},
	            r_run: {},
	            r_run_fast: {},
	            r_run_haste: {},
	            r_spell2: {},
	            r_spell3: {},
	            r_spell3_run: {},
	            r_spell4: {},
	            respawn_trans_rlauncher: {},
	            rlauncher_spell3: {},
	            spell1a: {}
	        }
	    },
	    238: {
	        10: {
	            all: {
	                chair_skin10: true,
	                step1_skin10: true,
	                step2_skin10: true
	            },
	            recall: {}
	        }
	    },
	    245: {
	        0: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        1: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        2: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        3: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        4: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        5: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        6: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        7: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        8: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        9: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        },
	        10: {
	            deathrespawn: {},
	            all: {
	                book_pen: true
	            }
	        }
	    },
	    254: {
	        0: {
	            all: {
	                teacup: true
	            },
	            taunt2: {}
	        },
	        1: {
	            all: {
	                teacup: true
	            },
	            taunt2: {}
	        },
	        3: {
	            all: {
	                teacup: true
	            },
	            taunt2: {}
	        },
	        4: {
	            all: {
	                teacup: true
	            },
	            taunt2: {}
	        }
	    },
	    412: {
	        1: {
	            all: {
	                coin1: true,
	                coin2: true,
	                coin3: true,
	                coin4: true,
	                coin5: true,
	                coin6: true,
	                coin7: true,
	                treasure_chest: true,
	                treasure_chest_cover: true,
	                tire: true
	            },
	            recall: {
	                tire: true
	            },
	            undersea_recall_loop: {
	                tire: true
	            },
	            undersea_recall_loop2: {
	                coin1: true,
	                coin2: true,
	                coin3: true,
	                coin4: true,
	                coin5: true,
	                coin6: true,
	                coin7: true,
	                treasure_chest: true,
	                treasure_chest_cover: true
	            },
	            undersea_recall_windup: {
	                tire: true
	            },
	            undersea_recall_windup2: {
	                coin1: true,
	                coin2: true,
	                coin3: true,
	                coin4: true,
	                coin5: true,
	                coin6: true,
	                coin7: true,
	                treasure_chest: true,
	                treasure_chest_cover: true
	            }
	        },
	        5: {
	            all: {
	                mini_root: true
	            },
	            joke: {}
	        }
	    },
	    420: {
	        0: {
	            all: {
	                c_tentacle1: true
	            }
	        },
	        1: {
	            all: {
	                c_tentacle1: true
	            }
	        }
	    },
	    429: {
	        3: {
	            death: {
	                altar_spear: true,
	                buffbone_cstm_back_spear1: true,
	                buffbone_cstm_back_spear2: true,
	                buffbone_cstm_back_spear3: true
	            }
	        }
	    },
	    432: {
	        0: {
	            all: {
	                follower_root: true
	            },
	            dance: {}
	        },
	        2: {
	            all: {
	                follower_root: true
	            },
	            dance: {}
	        },
	        3: {
	            all: {
	                follower_root: true
	            },
	            dance: {}
	        },
	        4: {
	            all: {
	                follower_root: true
	            },
	            dance: {}
	        }
	    },
	    gnarbig: {
	        0: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        1: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        2: {
	            all: {
	                rock: true,
	                cane_bot: true,
	                cane_top: true
	            },
	            spell1: {
	                cane_bot: true,
	                cane_top: true
	            },
	            laugh: {
	                cane_bot: true,
	                cane_top: true
	            },
	            recall: {
	                rock: true
	            }
	        },
	        3: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        4: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        5: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        6: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        7: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        8: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        9: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        10: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        11: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        },
	        12: {
	            all: {
	                rock: true
	            },
	            spell1: {},
	            laugh: {}
	        }
	    }
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function AnimationBone(model, anim, r, version) {
	    var self = this;
	    self.model = model;
	    self.anim = anim;
	    var numFrames = r.getUint32();
	    self.bone = r.getString().toLowerCase();
	    self.flags = r.getUint32();
	    self.frames = new Array(numFrames);
	    var scale = [1, 1, 1];
	    for (var i = 0; i < numFrames; ++i) {
	        var pos = [r.getFloat(), r.getFloat(), r.getFloat()];
	        var rot = [r.getFloat(), r.getFloat(), r.getFloat(), r.getFloat()];
	        if (version >= 3) scale = [r.getFloat(), r.getFloat(), r.getFloat()];
	        self.frames[i] = {
	            pos: pos,
	            rot: rot,
	            scale: scale
	        };
	    }
	    self.matrix = mat4.create();
	    self.tmpMat = mat4.create();
	    self.tmpMat2 = mat4.create();
	    self.tmpPos = vec3.create();
	    self.tmpRot = quat.create();
	    self.tmpScale = vec3.create();
	}
	AnimationBone.prototype.update = function (boneId, frame, r) {
	    var self = this;
	    self.index = boneId;
	    var parent = self.model.bones[boneId].parent;
	    var f0 = frame % self.frames.length,
	        f1 = (frame + 1) % self.frames.length;
	    vec3.lerp(self.tmpPos, self.frames[f0].pos, self.frames[f1].pos, r);
	    vec3.lerp(self.tmpScale, self.frames[f0].scale, self.frames[f1].scale, r);
	    quat.slerp(self.tmpRot, self.frames[f0].rot, self.frames[f1].rot, r);
	    self.translation(self.tmpMat2, self.tmpPos);
	    self.rotationQuat(self.tmpMat, self.tmpRot);
	    self.mulSlimDX(self.matrix, self.tmpMat, self.tmpMat2);
	    if (parent != -1) {
	        self.mulSlimDX(self.matrix, self.matrix, self.model.transforms[parent]);
	    }
	    mat4.copy(self.model.transforms[boneId], self.matrix);
	};

	AnimationBone.prototype.translation = function (out, vec) {
	    mat4.identity(out);
	    out[12] = vec[0];
	    out[13] = vec[1];
	    out[14] = vec[2];
	    return out
	};

	AnimationBone.prototype.rotationQuat = function (out, q) {
	    mat4.identity(out);
	    var xx = q[0] * q[0],
	        yy = q[1] * q[1],
	        zz = q[2] * q[2],
	        xy = q[0] * q[1],
	        zw = q[2] * q[3],
	        zx = q[2] * q[0],
	        yw = q[1] * q[3],
	        yz = q[1] * q[2],
	        xw = q[0] * q[3];
	    out[0] = 1 - 2 * (yy + zz);
	    out[1] = 2 * (xy + zw);
	    out[2] = 2 * (zx - yw);
	    out[4] = 2 * (xy - zw);
	    out[5] = 1 - 2 * (zz + xx);
	    out[6] = 2 * (yz + xw);
	    out[8] = 2 * (zx + yw);
	    out[9] = 2 * (yz - xw);
	    out[10] = 1 - 2 * (yy + xx);
	    return out
	};

	AnimationBone.prototype.mulSlimDX = function (out, l, r) {
	    var left = {
	        M11: l[0],
	        M12: l[1],
	        M13: l[2],
	        M14: l[3],
	        M21: l[4],
	        M22: l[5],
	        M23: l[6],
	        M24: l[7],
	        M31: l[8],
	        M32: l[9],
	        M33: l[10],
	        M34: l[11],
	        M41: l[12],
	        M42: l[13],
	        M43: l[14],
	        M44: l[15]
	    };
	    var right = {
	        M11: r[0],
	        M12: r[1],
	        M13: r[2],
	        M14: r[3],
	        M21: r[4],
	        M22: r[5],
	        M23: r[6],
	        M24: r[7],
	        M31: r[8],
	        M32: r[9],
	        M33: r[10],
	        M34: r[11],
	        M41: r[12],
	        M42: r[13],
	        M43: r[14],
	        M44: r[15]
	    };
	    out[0] = left.M11 * right.M11 + left.M12 * right.M21 + left.M13 * right.M31 + left.M14 * right.M41;
	    out[1] = left.M11 * right.M12 + left.M12 * right.M22 + left.M13 * right.M32 + left.M14 * right.M42;
	    out[2] = left.M11 * right.M13 + left.M12 * right.M23 + left.M13 * right.M33 + left.M14 * right.M43;
	    out[3] = left.M11 * right.M14 + left.M12 * right.M24 + left.M13 * right.M34 + left.M14 * right.M44;
	    out[4] = left.M21 * right.M11 + left.M22 * right.M21 + left.M23 * right.M31 + left.M24 * right.M41;
	    out[5] = left.M21 * right.M12 + left.M22 * right.M22 + left.M23 * right.M32 + left.M24 * right.M42;
	    out[6] = left.M21 * right.M13 + left.M22 * right.M23 + left.M23 * right.M33 + left.M24 * right.M43;
	    out[7] = left.M21 * right.M14 + left.M22 * right.M24 + left.M23 * right.M34 + left.M24 * right.M44;
	    out[8] = left.M31 * right.M11 + left.M32 * right.M21 + left.M33 * right.M31 + left.M34 * right.M41;
	    out[9] = left.M31 * right.M12 + left.M32 * right.M22 + left.M33 * right.M32 + left.M34 * right.M42;
	    out[10] = left.M31 * right.M13 + left.M32 * right.M23 + left.M33 * right.M33 + left.M34 * right.M43;
	    out[11] = left.M31 * right.M14 + left.M32 * right.M24 + left.M33 * right.M34 + left.M34 * right.M44;
	    out[12] = left.M41 * right.M11 + left.M42 * right.M21 + left.M43 * right.M31 + left.M44 * right.M41;
	    out[13] = left.M41 * right.M12 + left.M42 * right.M22 + left.M43 * right.M32 + left.M44 * right.M42;
	    out[14] = left.M41 * right.M13 + left.M42 * right.M23 + left.M43 * right.M33 + left.M44 * right.M43;
	    out[15] = left.M41 * right.M14 + left.M42 * right.M24 + left.M43 * right.M34 + left.M44 * right.M44;
	    return out
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function Animation(model, r, version) {
	    var self = this,
	        i;
	    self.model = model;
	    self.meshOverride = {};
	    self.name = r.getString().toLowerCase();
	    self.fps = r.getInt32();
	    var numBones = r.getUint32();
	    self.bones = new Array(numBones);
	    self.lookup = {};
	    for (i = 0; i < numBones; ++i) {
	        self.bones[i] = new AnimationBone(model, self, r, version);
	        self.lookup[self.bones[i].bone] = i;
	    }
	    if (numBones == 0 || self.fps <= 1) {
	        self.duration = 1e3;
	    } else {
	        self.duration = Math.floor(1e3 * (self.bones[0].frames.length / self.fps));
	    }
	}

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	var BaseAnimations = {
	    19: {
	        0: {
	            all: "idle"
	        }
	    },
	    32: {
	        4: {
	            all: "idle1_bow",
	            idle1_bow: "idle1"
	        }
	    },
	    55: {
	        7: {
	            idle1_candycane_below: "idle1"
	        }
	    }
	};

	/**
	 * @author lolking / http://www.lolking.net/models
	 * @author tengge / https://github.com/tengge1
	 */
	function Model(options) {
	    var self = this;
	    self.champion = options.champion || "1";
	    self.skin = options.skin || 0;
	    self.meshUrl = options.meshUrl;
	    self.animUrl = options.animUrl;
	    self.textureUrl = options.textureUrl;

	    self.loaded = false;
	    self.animsLoaded = false;

	    self.meshes = null;
	    self.vertices = null;
	    self.indices = null;
	    self.transforms = null;
	    self.bones = null;
	    self.boneLookup = {};
	    self.animIndex = -1;
	    self.animName = null;
	    self.baseAnim = null;
	    self.newAnimation = false;
	    self.animTime = 0;
	    self.tmpMat = mat4.create();
	    self.tmpVec = vec4.create();
	    self.ANIMATED = true;

	    self.dispatch = dispatch('load', 'loadMesh', 'loadTexture', 'loadAnim');

	    self.hiddenBones = null;
	    var hiddenBones = HiddenBones;
	    if (hiddenBones[self.champion] !== undefined) {
	        if (hiddenBones[self.champion][self.skin] !== undefined) {
	            self.hiddenBones = hiddenBones[self.champion][self.skin];
	        }
	    }

	    self.ambientColor = [.35, .35, .35, 1];
	    self.primaryColor = [1, 1, 1, 1];
	    self.secondaryColor = [.35, .35, .35, 1];
	    self.lightDir1 = vec3.create();
	    self.lightDir2 = vec3.create();
	    self.lightDir3 = vec3.create();
	    vec3.normalize(self.lightDir1, [5, 5, -5]);
	    vec3.normalize(self.lightDir2, [5, 5, 5]);
	    vec3.normalize(self.lightDir3, [-5, -5, -5]);

	    self.texture = null;
	    self.geometry = new THREE.BufferGeometry();
	    self.material = new THREE.MeshPhongMaterial();

	    var promise1 = new Promise(resolve => {
	        self.dispatch.on('loadMesh.Model', () => {
	            resolve();
	        });
	    });
	    var promise2 = new Promise(resolve => {
	        self.dispatch.on('loadTexture.Model', () => {
	            resolve();
	        });
	    });
	    var promise3 = new Promise(resolve => {
	        self.dispatch.on('loadAnim.Model', () => {
	            resolve();
	        });
	    });
	    Promise.all([promise1, promise2, promise3]).then(() => {
	        self.dispatch.call('load');
	    });
	}
	Model.prototype.getAnimations = function () {
	    if (!this.animations) {
	        return null;
	    }
	    var names = [];
	    this.animations.forEach(function (n) {
	        names.push(n.name);
	    });
	    return names;
	};

	Model.prototype.getAnimation = function (name) {
	    var self = this,
	        i, animIndex = -1;
	    if (!self.animations) {
	        return animIndex
	    }    name = name.toLowerCase();
	    if (name == "idle" || name == "attack") {
	        var anims = [],
	            re = new RegExp(name + "[0-9]*");
	        for (i = 0; i < self.animations.length; ++i) {
	            if (self.animations[i].name.search(re) == 0) anims.push(i);
	        }
	        if (anims.length > 0) {
	            animIndex = anims[0];
	        }
	    } else {
	        for (i = 0; i < self.animations.length; ++i) {
	            if (self.animations[i].name == name) {
	                animIndex = i;
	                break
	            }
	        }
	    }
	    return animIndex
	};

	Model.prototype.setAnimation = function (name) {
	    var self = this;
	    self.animName = name;
	    self.newAnimation = true;
	};

	Model.prototype.update = function (time) {
	    var self = this,
	        i, j;

	    if (self.animTime == 0) {
	        self.animTime = time;
	    }

	    if (!self.loaded || !self.vertices || !self.animations || self.animations.length == 0) {
	        return;
	    }

	    self.animIndex = self.getAnimation(self.animName);
	    if (self.animIndex == -1) {
	        self.animIndex = 0;
	        self.animName = "idle";
	    }
	    var baseAnims = BaseAnimations;
	    if (baseAnims[self.champion] !== undefined) {
	        if (baseAnims[self.champion][self.skin] !== undefined) {
	            var baseAnim = baseAnims[self.champion][self.skin],
	                baseIndex = -1;

	            if (baseAnim[self.animations[self.animIndex].name]) {
	                baseIndex = self.getAnimation(baseAnim[self.animations[self.animIndex].name]);
	            } else if (baseAnim["all"]) {
	                baseIndex = self.getAnimation(baseAnim["all"]);
	            }

	            if (baseIndex > -1) {
	                self.baseAnim = self.animations[baseIndex];
	            } else {
	                self.baseAnim = null;
	            }
	        }
	    }

	    var deltaTime = time - self.animTime;
	    var anim = self.animations[self.animIndex];

	    if (deltaTime >= anim.duration) {
	        self.animTime = time;
	        deltaTime = 0;
	    }

	    if (self.ANIMATED) {
	        var timePerFrame = 1e3 / anim.fps;
	        var frame = Math.floor(deltaTime / timePerFrame);
	        var r = deltaTime % timePerFrame / timePerFrame;
	        var hiddenBones = {};
	        if (self.hiddenBones) {
	            if (self.hiddenBones[anim.name]) {
	                hiddenBones = self.hiddenBones[anim.name];
	            } else if (self.hiddenBones["all"]) {
	                hiddenBones = self.hiddenBones["all"];
	            }
	        }
	        var b;
	        if (self.version >= 1) {
	            for (i = 0; i < self.bones.length; ++i) {
	                b = self.bones[i];
	                if (hiddenBones[b.name]) {
	                    mat4.identity(self.tmpMat);
	                    mat4.scale(self.tmpMat, self.tmpMat, vec3.set(self.tmpVec, 0, 0, 0));
	                    mat4.copy(self.transforms[i], self.tmpMat);
	                } else if (anim.lookup[b.name] !== undefined) {
	                    anim.bones[anim.lookup[b.name]].update(i, frame, r);
	                } else if (self.baseAnim && self.baseAnim.lookup[b.name] !== undefined) {
	                    self.baseAnim.bones[self.baseAnim.lookup[b.name]].update(i, frame, r);
	                } else {
	                    if (b.parent != -1) {
	                        AnimationBone.prototype.mulSlimDX(self.transforms[i], b.incrMatrix, self.transforms[b.parent]);
	                    } else {
	                        mat4.copy(self.transforms[i], b.incrMatrix);
	                    }
	                }
	            }
	        } else {
	            for (i = 0; i < anim.bones.length; ++i) {
	                b = anim.bones[i];
	                if (self.boneLookup[b.bone] !== undefined) {
	                    b.update(self.boneLookup[b.bone], frame, r);
	                } else {
	                    var parentBone = anim.bones[i - 1];
	                    if (!parentBone) continue;
	                    if (parentBone.index + 1 < self.transforms.length) {
	                        mat4.copy(self.transforms[parentBone.index + 1], self.transforms[parentBone.index]);
	                    }
	                    b.index = parentBone.index + 1;
	                }
	            }
	        }
	        var numBones = Math.min(self.transforms.length, self.bones.length);
	        for (i = 0; i < numBones; ++i) {
	            AnimationBone.prototype.mulSlimDX(self.transforms[i], self.bones[i].baseMatrix, self.transforms[i]);
	        }
	        mat4.identity(self.tmpMat);
	        var numVerts = self.vertices.length,
	            vec = self.tmpVec,
	            position = self.geometry.attributes.position.array,
	            normal = self.geometry.attributes.normal.array,
	            v, w, m, idx;
	        for (i = 0; i < numVerts; ++i) {
	            v = self.vertices[i];
	            idx = i * 3;
	            position[idx] = position[idx + 1] = position[idx + 2] = 0;
	            normal[idx] = normal[idx + 1] = normal[idx + 2] = 0;
	            for (j = 0; j < 4; ++j) {
	                if (v.weights[j] > 0) {
	                    w = v.weights[j];
	                    m = anim.fps == 1 ? self.tmpMat : self.transforms[v.bones[j]];
	                    vec3.transformMat4(vec, v.position, m);
	                    position[idx] += vec[0] * w;
	                    position[idx + 1] += vec[1] * w;
	                    position[idx + 2] += vec[2] * w;
	                    vec4.transformMat4(vec, v.normal, m);
	                    normal[idx] += vec[0] * w;
	                    normal[idx + 1] += vec[1] * w;
	                    normal[idx + 2] += vec[2] * w;
	                }
	            }
	        }
	        self.geometry.attributes.position.needsUpdate = true;
	        self.geometry.attributes.normal.needsUpdate = true;
	    }
	    if (self.newAnimation) {
	        self.newAnimation = false;
	    }
	};

	Model.prototype.load = function () {
	    var self = this;
	    var loader = new THREE.FileLoader();
	    loader.setResponseType('arraybuffer');
	    loader.load(self.meshUrl, function (buffer) {
	        self.loadMesh(buffer);
	    });
	};

	Model.prototype.loadMesh = function (buffer) {
	    if (!buffer) {
	        console.error("Bad buffer for DataView");
	        return
	    }
	    var self = this,
	        r = new DataView2(buffer),
	        i,
	        v,
	        idx;
	    try {
	        var magic = r.getUint32();
	        if (magic != 604210091) {
	            console.log("Bad magic value");
	            return
	        }
	    } catch (err) {
	        alert("Model currently isn't loading! We're sorry and hope to have this fixed soon.");
	        console.log(err);
	        return
	    }
	    self.version = r.getUint32();
	    var animFile = r.getString();
	    var textureFile = r.getString();
	    if (animFile && animFile.length > 0) {
	        var loader = new THREE.FileLoader();
	        loader.setResponseType('arraybuffer');
	        loader.load(self.animUrl, function (buffer) {
	            self.loadAnim(buffer);
	            self.dispatch.call('loadAnim');
	        });
	    }
	    if (textureFile && textureFile.length > 0) {
	        self.texture = new Texture$1(self, self.textureUrl);
	    }
	    var numMeshes = r.getUint32();
	    if (numMeshes > 0) {
	        self.meshes = new Array(numMeshes);
	        for (i = 0; i < numMeshes; ++i) {
	            var name = r.getString().toLowerCase();
	            var vStart = r.getUint32();
	            var vCount = r.getUint32();
	            var iStart = r.getUint32();
	            var iCount = r.getUint32();
	            self.meshes[i] = {
	                name: name,
	                vStart: vStart,
	                vCount: vCount,
	                iStart: iStart,
	                iCount: iCount
	            };
	        }
	    }
	    var numVerts = r.getUint32();
	    if (numVerts > 0) {
	        self.vertices = new Array(numVerts);
	        self.vbData = new Float32Array(numVerts * 8);
	        var position = [];
	        var normal = [];
	        var uv = [];
	        for (i = 0; i < numVerts; ++i) {
	            idx = i * 8;
	            self.vertices[i] = v = new Vertex(r);
	            self.vbData[idx] = v.position[0];
	            self.vbData[idx + 1] = v.position[1];
	            self.vbData[idx + 2] = v.position[2];
	            self.vbData[idx + 3] = v.normal[0];
	            self.vbData[idx + 4] = v.normal[1];
	            self.vbData[idx + 5] = v.normal[2];
	            self.vbData[idx + 6] = v.u;
	            self.vbData[idx + 7] = v.v;

	            position.push(v.position[0], v.position[1], v.position[2]);
	            normal.push(v.normal[0], v.normal[1], v.normal[2]);
	            uv.push(v.u, v.v);
	        }
	        self.geometry.addAttribute('position',
	            new THREE.BufferAttribute(new Float32Array(position), 3));
	        self.geometry.addAttribute('normal',
	            new THREE.BufferAttribute(new Float32Array(normal), 3));
	        self.geometry.addAttribute('uv',
	            new THREE.BufferAttribute(new Float32Array(uv), 2));
	    }
	    var numIndices = r.getUint32();
	    if (numIndices > 0) {
	        self.indices = new Array(numIndices);
	        for (i = 0; i < numIndices; ++i) {
	            self.indices[i] = r.getUint16();
	        }
	        self.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(self.indices), 1));
	    }
	    var numBones = r.getUint32();
	    if (numBones > 0) {
	        self.transforms = new Array(numBones);
	        self.bones = new Array(numBones);
	        for (i = 0; i < numBones; ++i) {
	            self.bones[i] = new Bone(self, i, r);
	            if (self.boneLookup[self.bones[i].name] !== undefined) {
	                self.bones[i].name = self.bones[i].name + "2";
	            }
	            self.boneLookup[self.bones[i].name] = i;
	            self.transforms[i] = new mat4.create;
	        }
	    }
	    self.loaded = true;
	    self.dispatch.call('loadMesh');
	};

	Model.prototype.loadAnim = function (buffer) {
	    if (!buffer) {
	        console.error("Bad buffer for DataView");
	        return
	    }
	    var self = this,
	        r = new DataView2(buffer),
	        i;
	    var magic = r.getUint32();
	    if (magic != 604210092) {
	        console.log("Bad magic value");
	        return
	    }
	    var version = r.getUint32();
	    if (version >= 2) {
	        var compressedData = new Uint8Array(buffer, r.position);
	        var data = null;
	        try {
	            data = pako.inflate(compressedData);
	        } catch (err) {
	            console.log("Decompression error: " + err);
	            return
	        }
	        r = new DataView2(data.buffer);
	    }
	    var numAnims = r.getUint32();
	    if (numAnims > 0) {
	        self.animations = new Array(numAnims);
	        for (i = 0; i < numAnims; ++i) {
	            self.animations[i] = new Animation(self, r, version);
	        }
	    }
	    self.animsLoaded = true;
	};

	Model.prototype.on = function (eventName, callback) {
	    this.dispatch.on(eventName, callback);
	};

	/**
	 * LOLLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function LOLLoader() {
	    BaseLoader.call(this);
	}

	LOLLoader.prototype = Object.create(BaseLoader.prototype);
	LOLLoader.prototype.constructor = LOLLoader;

	LOLLoader.prototype.load = function (url, options) {
	    if (!Array.isArray(url) || url.length < 3) {
	        console.warn(`LOLLoader: url必须是数组，而且包含.lmesh、.lanim、.png三个文件地址。`);
	        return new Promise(resolve => {
	            resolve(null);
	        });
	    }

	    var lmesh = url.filter(n => n.endsWith('.lmesh'))[0];
	    var lanim = url.filter(n => n.endsWith('.lanim'))[0];
	    var png = url.filter(n => n.endsWith('.png'))[0];

	    if (lmesh === undefined) {
	        console.warn(`LOLLoader: url中不包含.lmesh文件地址。`);
	        return new Promise(resolve => {
	            resolve(null);
	        });
	    }

	    if (lanim === undefined) {
	        console.warn(`LOLLoader: url中不包含.lanim文件地址。`);
	        return new Promise(resolve => {
	            resolve(null);
	        });
	    }

	    if (png === undefined) {
	        console.warn(`LOLLoader: url中不包含.png文件地址。`);
	        return new Promise(resolve => {
	            resolve(null);
	        });
	    }

	    var fileName = lmesh.split('/')[lmesh.split('/').length - 1];
	    var fileNameNoExt = fileName.split('.')[0];
	    var champion = fileNameNoExt.split('_')[0];
	    var skin = fileNameNoExt.split('_')[1];

	    return new Promise(resolve => {
	        var model = new Model({
	            champion: champion,
	            skin: parseInt(skin),
	            meshUrl: lmesh,
	            animUrl: lanim,
	            textureUrl: png
	        });
	        model.load();
	        model.on('load.LOLLoader', () => {
	            var geometry = model.geometry;
	            var material = model.material;

	            var mesh = new THREE.Mesh(geometry, material);
	            mesh.name = options.Name;

	            mesh.userData.type = 'lol';
	            mesh.userData.model = model;
	            mesh.userData.scripts = [{
	                id: null,
	                name: `${options.Name}动画`,
	                type: 'javascript',
	                source: this.createScripts(options.Name, model),
	                uuid: THREE.Math.generateUUID()
	            }];

	            resolve(mesh);
	        });
	    });
	};

	LOLLoader.prototype.createScripts = function (name, model) {
	    var animations = model.getAnimations();

	    return `var mesh = this.getObjectByName('${name}');\n` +
	        `var model = mesh.userData.model;\n\n` +
	        `// animNames: ${animations.join(',')}\n` +
	        `model.setAnimation('${animations[0]}');\n\n` +
	        `function update(clock, deltaTime) { \n    model.update(clock.getElapsedTime() * 1000); \n}`;
	};

	/**
	 * PMDLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function PMDLoader() {
	    BaseLoader.call(this);
	}

	PMDLoader.prototype = Object.create(BaseLoader.prototype);
	PMDLoader.prototype.constructor = PMDLoader;

	PMDLoader.prototype.load = function (url, options) {
	    return new Promise(resolve => {
	        var loader = new THREE.MMDLoader();

	        loader.loadModel(url, mesh => {
	            mesh.name = options.Name;
	            if (options.Animation) {
	                this.loadAnimation(mesh, options.Animation).then(() => {
	                    resolve(mesh);
	                });
	            } else {
	                resolve(mesh);
	            }
	        }, undefined, () => {
	            // 某个图片下载失败会导致返回null
	            // resolve(null);
	        });
	    });
	};

	PMDLoader.prototype.loadAnimation = function (mesh, animation) {
	    return new Promise(resolve => {
	        var loader = new THREE.MMDLoader();
	        loader.loadVmd(animation.Url, vmd => {
	            loader.pourVmdIntoModel(mesh, vmd);
	            resolve(mesh);
	        }, undefined, () => {
	            resolve(null);
	        });
	    });
	};

	const Loaders = {
	    'amf': AMFLoader,
	    'awd': AWDLoader,
	    'babylon': BabylonLoader,
	    'binary': BinaryLoader,
	    'ctm': CTMLoader,
	    'dae': ColladaLoader,
	    'fbx': FBXLoader,
	    'glb': GLTFLoader,
	    'gltf': GLTFLoader,
	    'kmz': KMZLoader,
	    'md2': MD2Loader,
	    'json': ObjectLoader,
	    'obj': OBJLoader,
	    'ply': PLYLoader,
	    'stl': STLLoader,
	    'vtk': VTKLoader,
	    'lol': LOLLoader,
	    'pmd': PMDLoader,
	    'pmx': PMDLoader,
	};

	/**
	 * ModelLoader
	 * @author tengge / https://github.com/tengge1
	 */
	function ModelLoader() {
	    BaseLoader.call(this);
	}

	ModelLoader.prototype = Object.create(BaseLoader.prototype);
	ModelLoader.prototype.constructor = ModelLoader;

	ModelLoader.prototype.load = function (url, options) {
	    options = options || {};
	    var type = options.Type;

	    if (type === undefined) {
	        console.warn(`ModelLoader: 未传递type参数，无法加载。`);
	        return new Promise(resolve => {
	            resolve(null);
	        });
	    }

	    return new Promise(resolve => {
	        var loader = Loaders[type];
	        if (loader === undefined) {
	            console.warn(`ModelLoader: 不存在加载${type}后缀模型的加载器。`);
	            resolve(null);
	            return;
	        }
	        (new loader(this.app)).load(url, options).then(obj => {
	            resolve(obj);
	        });
	    });
	};

	/**
	 * ServerObject
	 * @author tengge / https://github.com/tengge1
	 */
	function ServerObject() {
	    BaseSerializer.call(this);
	}

	ServerObject.prototype = Object.create(BaseSerializer.prototype);
	ServerObject.prototype.constructor = ServerObject;

	ServerObject.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);
	    json.userData = Object.assign({}, obj.userData);
	    delete json.userData.model;
	    return json;
	};

	ServerObject.prototype.fromJSON = function (json, options) {
	    var url = json.userData.Url;

	    if (url.indexOf(';') > -1) { // 包含多个入口文件
	        url = url.split(';').map(n => options.server + n);
	    } else {
	        url = options.server + url;
	    }

	    return new Promise(resolve => {
	        var loader = new ModelLoader();
	        loader.load(url, json.userData).then(obj => {
	            if (obj) {
	                Object3DSerializer.prototype.fromJSON.call(this, json, obj);
	                resolve(obj);
	            } else {
	                resolve(null);
	            }
	        });
	    });
	};

	/**
	 * WebGLShadowMapSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function WebGLShadowMapSerializer() {
	    BaseSerializer.call(this);
	}

	WebGLShadowMapSerializer.prototype = Object.create(BaseSerializer.prototype);
	WebGLShadowMapSerializer.prototype.constructor = WebGLShadowMapSerializer;

	WebGLShadowMapSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.autoUpdate = obj.autoUpdate;
	    json.enabled = obj.enabled;
	    json.needsUpdate = obj.needsUpdate;
	    json.type = obj.type;

	    return json;
	};

	WebGLShadowMapSerializer.prototype.fromJSON = function (json, parent) {
	    if (parent === undefined) {
	        console.warn(`WebGLShadowMapSerializer: parent不允许为空！`);
	        return null;
	    }

	    var obj = parent;

	    obj.autoUpdate = json.autoUpdate;
	    obj.enabled = json.enabled;
	    obj.needsUpdate = true;
	    obj.type = json.type;

	    return obj;
	};

	/**
	 * WebGLRendererSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function WebGLRendererSerializer() {
	    BaseSerializer.call(this);
	}

	WebGLRendererSerializer.prototype = Object.create(BaseSerializer.prototype);
	WebGLRendererSerializer.prototype.constructor = WebGLRendererSerializer;

	WebGLRendererSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.antialias = true;
	    json.autoClear = obj.autoClear;
	    json.autoClearColor = obj.autoClearColor;
	    json.autoClearDepth = obj.autoClearDepth;
	    json.autoClearStencil = obj.autoClearStencil;
	    json.autoUpdateScene = obj.autoUpdateScene;
	    json.clippingPlanes = obj.clippingPlanes;
	    json.gammaFactor = obj.gammaFactor;
	    json.gammaInput = obj.gammaInput;
	    json.gammaOutput = obj.gammaOutput;
	    json.localClippingEnabled = obj.localClippingEnabled;
	    json.physicallyCorrectLights = obj.physicallyCorrectLights;
	    json.shadowMap = (new WebGLShadowMapSerializer()).toJSON(obj.shadowMap);
	    json.sortObjects = obj.sortObjects;
	    json.toneMapping = obj.toneMapping;
	    json.toneMappingExposure = obj.toneMappingExposure;
	    json.toneMappingWhitePoint = obj.toneMappingWhitePoint;

	    return json;
	};

	WebGLRendererSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.WebGLRenderer({ antialias: json.antialias }) : parent;

	    obj.autoClear = json.autoClear;
	    obj.autoClearColor = json.autoClearColor;
	    obj.autoClearDepth = json.autoClearDepth;
	    obj.autoClearStencil = json.autoClearStencil;
	    obj.autoUpdateScene = json.autoUpdateScene;
	    obj.clippingPlanes = json.clippingPlanes;
	    obj.gammaFactor = json.gammaFactor;
	    obj.gammaInput = json.gammaInput;
	    obj.gammaOutput = json.gammaOutput;
	    obj.localClippingEnabled = json.localClippingEnabled;
	    obj.physicallyCorrectLights = json.physicallyCorrectLights;
	    (new WebGLShadowMapSerializer()).fromJSON(json.shadowMap, obj.shadowMap);
	    obj.sortObjects = json.sortObjects;
	    obj.toneMapping = json.toneMapping;
	    obj.toneMappingExposure = json.toneMappingExposure;
	    obj.toneMappingWhitePoint = json.toneMappingWhitePoint;

	    return obj;
	};

	/**
	 * OptionsSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function OptionsSerializer() {
	    BaseSerializer.call(this);
	}

	OptionsSerializer.prototype = Object.create(BaseSerializer.prototype);
	OptionsSerializer.prototype.constructor = OptionsSerializer;

	OptionsSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);
	    Object.assign(json, obj);
	    return json;
	};

	OptionsSerializer.prototype.fromJSON = function (json) {
	    var obj = {};

	    Object.keys(json).forEach(n => {
	        if (n === '_id' || n === 'metadata' || n === 'server') { // 由于不同服务器的服务端不一样，所以不能反序列化server配置
	            return;
	        }
	        obj[n] = json[n];
	    });

	    return obj;
	};

	/**
	 * ScriptSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ScriptSerializer() {
	    BaseSerializer.call(this);
	}

	ScriptSerializer.prototype = Object.create(BaseSerializer.prototype);
	ScriptSerializer.prototype.constructor = ScriptSerializer;

	ScriptSerializer.prototype.toJSON = function (scripts) {
	    var list = [];

	    Object.keys(scripts).forEach(uuid => {
	        var json = BaseSerializer.prototype.toJSON.call(this);

	        var script = scripts[uuid];

	        Object.assign(json, {
	            id: script.id,
	            name: script.name,
	            type: script.type,
	            source: script.source,
	            uuid: script.uuid
	        });

	        list.push(json);
	    });

	    return list;
	};

	ScriptSerializer.prototype.fromJSON = function (jsons, parent) {
	    parent = parent || {};

	    jsons.forEach(json => {
	        parent[json.uuid] = {
	            id: json.id,
	            name: json.name,
	            type: json.type,
	            source: json.source,
	            uuid: json.uuid
	        };
	    });

	    return parent;
	};

	/**
	 * AnimationSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function AnimationSerializer() {
	    BaseSerializer.call(this);
	}

	AnimationSerializer.prototype = Object.create(BaseSerializer.prototype);
	AnimationSerializer.prototype.constructor = AnimationSerializer;

	AnimationSerializer.prototype.toJSON = function (manager) {
	    var list = [];

	    var groups = manager.animations;

	    groups.forEach(n => {
	        var json = BaseSerializer.prototype.toJSON.call(this, n);

	        Object.assign(json, n);
	        json.animations = n.animations.map(m => m.uuid);

	        list.push(json);

	        n.animations.forEach(m => {
	            var json1 = BaseSerializer.prototype.toJSON.call(this, m);

	            Object.assign(json1, m);

	            list.push(json1);
	        });
	    });

	    return list;
	};

	AnimationSerializer.prototype.fromJSON = function (jsons) {
	    var list = [];

	    var groups = jsons.filter(n => n.type === 'AnimationGroup');

	    groups.forEach(n => {
	        var obj = BaseSerializer.prototype.fromJSON.call(this, n);
	        Object.assign(obj, n);

	        obj.id = obj._id;
	        delete obj._id;
	        delete obj.metadata;

	        var animations = obj.animations;
	        obj.animations = [];

	        animations.forEach(m => {
	            var json1 = jsons.filter(o => o.uuid === m)[0];

	            if (json1 === undefined) {
	                console.warn(`AnimationSerializer: 不存在uuid为${m}的动画。`);
	                return;
	            }
	            var obj1 = BaseSerializer.prototype.fromJSON.call(this, json1);

	            Object.assign(obj1, json1);
	            obj1.id = obj1._id;
	            delete obj1._id;
	            delete obj1.metadata;

	            obj.animations.push(obj1);
	        });

	        list.push(obj);
	    });

	    return list;
	};

	/**
	 * CameraSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CameraSerializer() {
	    BaseSerializer.call(this);
	}

	CameraSerializer.prototype = Object.create(BaseSerializer.prototype);
	CameraSerializer.prototype.constructor = CameraSerializer;

	CameraSerializer.prototype.filter = function (obj) {
	    if (obj instanceof THREE.Camera) {
	        return true;
	    } else if (obj.metadata && obj.metadata.generator === this.constructor.name) {
	        return true;
	    } else {
	        return false;
	    }
	};

	CameraSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.matrixWorldInverse = obj.matrixWorldInverse;
	    json.projectionMatrix = obj.projectionMatrix;

	    return json;
	};

	CameraSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Camera() : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.matrixWorldInverse.copy(json.matrixWorldInverse);
	    obj.projectionMatrix.copy(json.projectionMatrix);

	    return obj;
	};

	/**
	 * OrthographicCameraSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function OrthographicCameraSerializer() {
	    BaseSerializer.call(this);
	}

	OrthographicCameraSerializer.prototype = Object.create(BaseSerializer.prototype);
	OrthographicCameraSerializer.prototype.constructor = OrthographicCameraSerializer;

	OrthographicCameraSerializer.prototype.toJSON = function (obj) {
	    var json = CameraSerializer.prototype.toJSON.call(this, obj);

	    json.bottom = obj.bottom;
	    json.far = obj.far;
	    json.left = obj.left;
	    json.near = obj.near;
	    json.right = obj.right;
	    json.top = obj.top;
	    json.view = obj.view;
	    json.zoom = obj.zoom;

	    return json;
	};

	OrthographicCameraSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.OrthographicCamera() : parent;

	    CameraSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.bottom = json.bottom;
	    obj.far = json.far;
	    obj.left = json.left;
	    obj.near = json.near;
	    obj.right = json.right;
	    obj.top = json.top;
	    obj.view = json.view;
	    obj.zoom = json.zoom;

	    return obj;
	};

	/**
	 * PerspectiveCameraSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PerspectiveCameraSerializer() {
	    BaseSerializer.call(this);
	}

	PerspectiveCameraSerializer.prototype = Object.create(BaseSerializer.prototype);
	PerspectiveCameraSerializer.prototype.constructor = PerspectiveCameraSerializer;

	PerspectiveCameraSerializer.prototype.toJSON = function (obj) {
	    var json = CameraSerializer.prototype.toJSON.call(this, obj);

	    json.aspect = obj.aspect;
	    json.far = obj.far;
	    json.filmGauge = obj.filmGauge;
	    json.filmOffset = obj.filmOffset;
	    json.focus = obj.focus;
	    json.fov = obj.fov;
	    json.near = obj.near;
	    json.view = obj.view;
	    json.zoom = obj.zoom;

	    return json;
	};

	PerspectiveCameraSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PerspectiveCamera() : parent;

	    CameraSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.aspect = json.aspect;
	    obj.far = json.far;
	    obj.filmGauge = json.filmGauge;
	    obj.filmOffset = json.filmOffset;
	    obj.focus = json.focus;
	    obj.fov = json.fov;
	    obj.near = json.near;
	    obj.view = json.view;
	    obj.zoom = json.zoom;

	    return obj;
	};

	var Serializers$3 = {
	    'OrthographicCamera': OrthographicCameraSerializer,
	    'PerspectiveCamera': PerspectiveCameraSerializer,
	    'Camera': CameraSerializer
	};

	/**
	 * CamerasSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function CamerasSerializer() {
	    BaseSerializer.call(this);
	}

	CamerasSerializer.prototype = Object.create(BaseSerializer.prototype);
	CamerasSerializer.prototype.constructor = CamerasSerializer;

	CamerasSerializer.prototype.toJSON = function (obj) {
	    var serializer = Serializers$3[obj.constructor.name];

	    if (serializer === undefined) {
	        console.warn(`CamerasSerializer: 无法序列化${obj.constructor.name}。`);
	        return null;
	    }

	    return (new serializer()).toJSON(obj);
	};

	CamerasSerializer.prototype.fromJSON = function (json, parent) {
	    var generator = json.metadata.generator;

	    var serializer = Serializers$3[generator.replace('Serializer', '')];

	    if (serializer === undefined) {
	        console.warn(`CamerasSerializer: 不存在 ${generator} 的反序列化器`);
	        return null;
	    }

	    return (new serializer()).fromJSON(json, parent);
	};

	/**
	 * WebGLRenderTargetSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function WebGLRenderTargetSerializer() {
	    BaseSerializer.call(this);
	}

	WebGLRenderTargetSerializer.prototype = Object.create(BaseSerializer.prototype);
	WebGLRenderTargetSerializer.prototype.constructor = WebGLRenderTargetSerializer;

	WebGLRenderTargetSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.depthBuffer = obj.depthBuffer;
	    json.depthTexture = obj.depthTexture == null ? null : (new TexturesSerializer()).toJSON(obj.depthTexture);
	    json.height = obj.height;
	    json.scissor = obj.scissor;
	    json.scissorTest = obj.scissorTest;
	    json.stencilBuffer = obj.stencilBuffer;
	    json.texture = obj.texture == null ? null : (new TexturesSerializer()).toJSON(obj.texture);
	    json.viewport = obj.viewport;
	    json.width = obj.width;
	    json.isWebGLRenderTarget = obj.isWebGLRenderTarget;

	    return json;
	};

	WebGLRenderTargetSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.WebGLRenderTarget(json.width, json.height) : parent;

	    obj.depthBuffer = json.depthBuffer;
	    obj.depthTexture = json.depthTexture == null ? null : (new TexturesSerializer()).fromJSON(json.depthTexture);
	    obj.height = json.height;
	    obj.scissor.copy(json.scissor);
	    obj.scissorTest = json.scissorTest;
	    obj.stencilBuffer = json.stencilBuffer;
	    obj.texture = json.texture == null ? null : (new TexturesSerializer()).fromJSON(json.texture);
	    obj.viewport.copy(json.viewport);
	    obj.width = json.width;
	    obj.isWebGLRenderTarget = json.isWebGLRenderTarget;

	    return obj;
	};

	/**
	 * LightShadowSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LightShadowSerializer() {
	    BaseSerializer.call(this);
	}

	LightShadowSerializer.prototype = Object.create(BaseSerializer.prototype);
	LightShadowSerializer.prototype.constructor = LightShadowSerializer;

	LightShadowSerializer.prototype.toJSON = function (obj) {
	    var json = BaseSerializer.prototype.toJSON.call(this, obj);

	    json.bias = obj.bias;
	    json.camera = (new CamerasSerializer()).toJSON(obj.camera);
	    json.map = obj.map == null ? null : (new WebGLRenderTargetSerializer()).toJSON(obj.map);
	    json.mapSize = obj.mapSize;
	    json.matrix = obj.matrix;
	    json.radius = obj.radius;

	    return json;
	};

	LightShadowSerializer.prototype.fromJSON = function (json, parent) {
	    var camera = (new CamerasSerializer()).fromJSON(json.camera);

	    var obj = parent === undefined ? new THREE.LightShadow(camera) : parent;

	    obj.bias = json.bias;
	    obj.camera.copy(camera);
	    // 纹理时自动生成的，不要反序列化
	    // obj.map = json.map == null ? null : (new WebGLRenderTargetSerializer()).fromJSON(json.map);
	    obj.mapSize.copy(json.mapSize);
	    obj.matrix.copy(json.matrix);
	    obj.radius = json.radius;

	    return obj;
	};

	/**
	 * DirectionalLightShadowSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function DirectionalLightShadowSerializer() {
	    BaseSerializer.call(this);
	}

	DirectionalLightShadowSerializer.prototype = Object.create(BaseSerializer.prototype);
	DirectionalLightShadowSerializer.prototype.constructor = DirectionalLightShadowSerializer;

	DirectionalLightShadowSerializer.prototype.toJSON = function (obj) {
	    var json = LightShadowSerializer.prototype.toJSON.call(this, obj);

	    json.isDirectionalLightShadow = obj.isDirectionalLightShadow;

	    return json;
	};

	DirectionalLightShadowSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.DirectionalLightShadow() : parent;

	    LightShadowSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * SpotLightShadowSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SpotLightShadowSerializer() {
	    BaseSerializer.call(this);
	}

	SpotLightShadowSerializer.prototype = Object.create(BaseSerializer.prototype);
	SpotLightShadowSerializer.prototype.constructor = SpotLightShadowSerializer;

	SpotLightShadowSerializer.prototype.toJSON = function (obj) {
	    var json = LightShadowSerializer.prototype.toJSON.call(this, obj);

	    json.isSpotLightShadow = obj.isSpotLightShadow;

	    return json;
	};

	SpotLightShadowSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.SpotLightShadow() : parent;

	    LightShadowSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	var Serializers$4 = {
	    'LightShadow': LightShadowSerializer,
	    'DirectionalLightShadow': DirectionalLightShadowSerializer,
	    'SpotLightShadow': SpotLightShadowSerializer
	};

	/**
	 * LightShadowsSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LightShadowsSerializer() {
	    BaseSerializer.call(this);
	}

	LightShadowsSerializer.prototype = Object.create(BaseSerializer.prototype);
	LightShadowsSerializer.prototype.constructor = LightShadowsSerializer;

	LightShadowsSerializer.prototype.toJSON = function (obj) {
	    var serializer = Serializers$4[obj.constructor.name];

	    if (serializer === undefined) {
	        console.warn(`LightShadowsSerializer: 无法序列化${obj.constructor.name}。`);
	        return null;
	    }

	    return (new serializer()).toJSON(obj);
	};

	LightShadowsSerializer.prototype.fromJSON = function (json) {
	    var generator = json.metadata.generator;

	    var serializer = Serializers$4[generator.replace('Serializer', '')];

	    if (serializer === undefined) {
	        console.warn(`LightShadowsSerializer: 不存在 ${generator} 的反序列化器`);
	        return null;
	    }

	    return (new serializer()).fromJSON(json);
	};

	/**
	 * LightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function LightSerializer() {
	    BaseSerializer.call(this);
	}

	LightSerializer.prototype = Object.create(BaseSerializer.prototype);
	LightSerializer.prototype.constructor = LightSerializer;

	LightSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.color = obj.color;
	    json.intensity = obj.intensity;
	    json.isLight = obj.isLight;
	    json.shadow = obj.shadow == null ? null : (new LightShadowsSerializer()).toJSON(obj.shadow);

	    return json;
	};

	LightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.Light() : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.color = new THREE.Color(json.color);
	    obj.intensity = json.intensity;
	    obj.isLight = json.isLight;

	    if (json.shadow) {
	        obj.shadow = (new LightShadowsSerializer()).fromJSON(json.shadow);
	    }

	    return obj;
	};

	/**
	 * AmbientLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function AmbientLightSerializer() {
	    BaseSerializer.call(this);
	}

	AmbientLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	AmbientLightSerializer.prototype.constructor = AmbientLightSerializer;

	AmbientLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.isAmbientLight = obj.isAmbientLight;

	    return json;
	};

	AmbientLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.AmbientLight(json.color, json.intensity) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isAmbientLight = json.isAmbientLight;

	    return obj;
	};

	/**
	 * DirectionalLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function DirectionalLightSerializer() {
	    BaseSerializer.call(this);
	}

	DirectionalLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	DirectionalLightSerializer.prototype.constructor = DirectionalLightSerializer;

	DirectionalLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.isDirectionalLight = obj.isDirectionalLight;

	    return json;
	};

	DirectionalLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.DirectionalLight(json.color, json.intensity) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isDirectionalLight = json.isDirectionalLight;

	    return obj;
	};

	/**
	 * HemisphereLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function HemisphereLightSerializer() {
	    BaseSerializer.call(this);
	}

	HemisphereLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	HemisphereLightSerializer.prototype.constructor = HemisphereLightSerializer;

	HemisphereLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.isHemisphereLight = obj.isHemisphereLight;
	    json.skyColor = obj.skyColor;
	    json.groundColor = obj.groundColor;

	    return json;
	};

	HemisphereLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.HemisphereLight(json.skyColor, json.groundColor, json.intensity) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isHemisphereLight = json.isHemisphereLight;

	    return obj;
	};

	/**
	 * PointLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function PointLightSerializer() {
	    BaseSerializer.call(this);
	}

	PointLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	PointLightSerializer.prototype.constructor = PointLightSerializer;

	PointLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.isPointLight = obj.isPointLight;
	    json.distance = obj.distance;
	    json.decay = obj.decay;

	    return json;
	};

	PointLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.PointLight(json.color, json.intensity, json.distance, json.decay) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isPointLight = json.isPointLight;

	    return obj;
	};

	/**
	 * SpotLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SpotLightSerializer() {
	    BaseSerializer.call(this);
	}

	SpotLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	SpotLightSerializer.prototype.constructor = SpotLightSerializer;

	SpotLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.isSpotLight = obj.isSpotLight;
	    json.distance = obj.distance;
	    json.angle = obj.angle;
	    json.penumbra = obj.penumbra;
	    json.decay = obj.decay;

	    return json;
	};

	SpotLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.SpotLight(
	        json.color,
	        json.intensity,
	        json.distance,
	        json.angle,
	        json.penumbra,
	        json.decay) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isSpotLight = json.isSpotLight;
	    obj.distance = json.distance;
	    obj.angle = json.angle;
	    obj.penumbra = json.penumbra;
	    obj.decay = json.decay;

	    return obj;
	};

	/**
	 * RectAreaLightSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function RectAreaLightSerializer() {
	    BaseSerializer.call(this);
	}

	RectAreaLightSerializer.prototype = Object.create(BaseSerializer.prototype);
	RectAreaLightSerializer.prototype.constructor = RectAreaLightSerializer;

	RectAreaLightSerializer.prototype.toJSON = function (obj) {
	    var json = LightSerializer.prototype.toJSON.call(this, obj);

	    json.width = obj.width;
	    json.height = obj.height;

	    return json;
	};

	RectAreaLightSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.RectAreaLight(json.color, json.intensity, json.width, json.height) : parent;

	    LightSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.isRectAreaLight = true;

	    return obj;
	};

	/**
	 * AudioSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function AudioSerializer() {
	    BaseSerializer.call(this);
	}

	AudioSerializer.prototype = Object.create(BaseSerializer.prototype);
	AudioSerializer.prototype.constructor = AudioSerializer;

	AudioSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.autoplay = obj.autoplay;
	    json.loop = obj.getLoop();
	    json.volume = obj.getVolume();

	    return json;
	};

	AudioSerializer.prototype.fromJSON = function (json, parent, audioListener) {
	    if (audioListener === undefined) {
	        audioListener = new THREE.AudioListener();
	    }
	    var obj = parent === undefined ? new THREE.Audio(audioListener) : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.autoplay = json.autoplay;
	    obj.setLoop(json.loop);
	    obj.setVolume(json.volume);

	    return obj;
	};

	/**
	 * AudioListenerSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function AudioListenerSerializer() {
	    BaseSerializer.call(this);
	}

	AudioListenerSerializer.prototype = Object.create(BaseSerializer.prototype);
	AudioListenerSerializer.prototype.constructor = AudioListenerSerializer;

	AudioListenerSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.masterVolume = obj.getMasterVolume();

	    return json;
	};

	AudioListenerSerializer.prototype.fromJSON = function (json, parent) {
	    var obj = parent === undefined ? new THREE.AudioListener() : parent;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.setMasterVolume(json.masterVolume);

	    return obj;
	};

	/**
	 * ReflectorSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ReflectorSerializer() {
	    BaseSerializer.call(this);
	}

	ReflectorSerializer.prototype = Object.create(BaseSerializer.prototype);
	ReflectorSerializer.prototype.constructor = ReflectorSerializer;

	ReflectorSerializer.prototype.toJSON = function (obj) {
	    var json = MeshSerializer.prototype.toJSON.call(this, obj);

	    if (json.userData.mesh) {
	        json.userData.mesh = (new MeshSerializer()).toJSON(json.userData.mesh);
	    }

	    return json;
	};

	ReflectorSerializer.prototype.fromJSON = function (json) {
	    var geometry = (new GeometriesSerializer()).fromJSON(json.geometry);
	    var obj = new THREE.Reflector(geometry, {
	        color: json.userData.color,
	        textureWidth: parseInt(json.userData.size),
	        textureHeight: parseInt(json.userData.size),
	        clipBias: json.userData.clipBias,
	        recursion: json.userData.recursion ? 1 : 0
	    });

	    MeshSerializer.prototype.fromJSON.call(this, json, obj);

	    if (obj.userData.mesh) {
	        obj.userData.mesh = (new MeshSerializer()).fromJSON(obj.userData.mesh);
	    }

	    return obj;
	};

	/**
	 * 火焰
	 */
	function Fire(camera, options = {}) {
	    THREE.Object3D.call(this);

	    VolumetricFire.texturePath = 'assets/textures/VolumetricFire/';

	    var width = options.width || 2;
	    var height = options.height || 4;
	    var depth = options.depth || 2;
	    var sliceSpacing = options.sliceSpacing || 0.5;

	    var fire = new VolumetricFire(
	        width,
	        height,
	        depth,
	        sliceSpacing,
	        camera
	    );

	    this.add(fire.mesh);

	    fire.mesh.name = '火焰';

	    this.name = '火焰';
	    this.position.y = 2;

	    Object.assign(this.userData, {
	        type: 'Fire',
	        fire: fire,
	        width: width,
	        height: height,
	        depth: depth,
	        sliceSpacing: sliceSpacing
	    });
	}

	Fire.prototype = Object.create(THREE.Object3D.prototype);
	Fire.prototype.constructor = Fire;

	/**
	 * FireSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function FireSerializer() {
	    BaseSerializer.call(this);
	}

	FireSerializer.prototype = Object.create(BaseSerializer.prototype);
	FireSerializer.prototype.constructor = FireSerializer;

	FireSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    delete json.userData.fire;

	    return json;
	};

	FireSerializer.prototype.fromJSON = function (json, parent, camera) {
	    var fire = new Fire(camera, {
	        width: json.userData.width,
	        height: json.userData.height,
	        depth: json.userData.depth,
	        sliceSpacing: json.userData.sliceSpacing
	    });

	    Object3DSerializer.prototype.fromJSON.call(this, json, fire);

	    fire.userData.fire.update(0);

	    return fire;
	};

	var vertexShader = "attribute float shift;\r\nuniform float time;\r\nuniform float size;\r\nuniform float lifetime;\r\nuniform float projection;\r\nvarying float progress;\r\n\r\nfloat cubicOut( float t ) {\r\n\r\n  float f = t - 1.0;\r\n  return f * f * f + 1.0;\r\n\r\n}\r\n\r\nvoid main () {\r\n\r\n  progress = fract( time * 2. / lifetime + shift );\r\n  float eased = cubicOut( progress );\r\n  vec3 pos = vec3( position.x * eased, position.y * eased, position.z );\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1. );\r\n  gl_PointSize = ( projection * size ) / gl_Position.w;\r\n\r\n}";

	var fragmentShader = "uniform sampler2D texture;\r\nvarying float progress;\r\n\r\nvoid main() {\r\n\r\n  vec3 color = vec3( 1. );\r\n  gl_FragColor = texture2D( texture, gl_PointCoord ) * vec4( color, .3 * ( 1. - progress ) );\r\n\r\n}";

	/**
	 * 烟
	 * @author yomotsu / http://yomotsu.net
	 * ported from http://webgl-fire.appspot.com/html/fire.html
	 *
	 * https://www.youtube.com/watch?v=jKRHmQmduDI
	 * https://graphics.ethz.ch/teaching/former/imagesynthesis_06/miniprojects/p3/
	 * https://www.iusb.edu/math-compsci/_prior-thesis/YVanzine_thesis.pdf
	 * @param {*} camera 相机
	 * @param {*} renderer 渲染器
	 * @param {*} options 选项
	 */
	function Smoke(camera, renderer, options = {}) {
	    var particleCount = options.particleCount || 32;
	    var size = options.size || 3;
	    var lifetime = options.lifetime || 10;

	    // 几何体
	    var geometry = new THREE.BufferGeometry();

	    var position = new Float32Array(particleCount * 3);
	    var shift = new Float32Array(particleCount);

	    for (var i = 0; i < particleCount; i++) {
	        position[i * 3 + 0] = THREE.Math.randFloat(-0.5, 0.5);
	        position[i * 3 + 1] = 2.4;
	        position[i * 3 + 3] = THREE.Math.randFloat(-0.5, 0.5);
	        shift[i] = Math.random() * 1;
	    }

	    geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
	    geometry.addAttribute('shift', new THREE.BufferAttribute(shift, 1));

	    // 材质
	    var texture = (new THREE.TextureLoader()).load('assets/textures/VolumetricFire/smoke.png');

	    var uniforms = {
	        time: { type: 'f', value: 0 },
	        size: { type: 'f', value: size },
	        texture: { type: 't', value: texture },
	        lifetime: { type: 'f', value: lifetime },
	        projection: { type: 'f', value: Math.abs(renderer.domElement.height / (2 * Math.tan(THREE.Math.degToRad(camera.fov)))) }
	    };

	    var material = new THREE.ShaderMaterial({
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader,
	        uniforms: uniforms,
	        blending: THREE.AdditiveBlending,
	        transparent: true,
	        depthWrite: false
	    });

	    THREE.Points.call(this, geometry, material);

	    this.sortParticles = true;

	    this.name = '烟';

	    Object.assign(this.userData, {
	        type: 'Smoke',
	        particleCount: particleCount,
	        size: size,
	        lifetime: lifetime
	    });
	}

	Smoke.prototype = Object.create(THREE.Points.prototype);
	Smoke.prototype.constructor = Smoke;

	Smoke.prototype.update = function (elapsed) {
	    this.material.uniforms.time.value = elapsed;
	};

	/**
	 * SmokeSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SmokeSerializer() {
	    BaseSerializer.call(this);
	}

	SmokeSerializer.prototype = Object.create(BaseSerializer.prototype);
	SmokeSerializer.prototype.constructor = SmokeSerializer;

	SmokeSerializer.prototype.toJSON = function (obj) {
	    var json = MeshSerializer.prototype.toJSON.call(this, obj);

	    return json;
	};

	SmokeSerializer.prototype.fromJSON = function (json, parent, camera, renderer) {
	    var obj = parent || new Smoke(camera, renderer);

	    MeshSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.update(0);

	    return obj;
	};

	/**
	 * 天空
	 * @param {*} options 选项
	 */
	function Sky(options) {
	    THREE.Object3D.call(this);

	    options = options || {};

	    var turbidity = options.turbidity || 10; // 浑浊度
	    var rayleigh = options.rayleigh || 2; // 瑞利
	    var luminance = options.luminance || 1; // 亮度
	    var mieCoefficient = options.mieCoefficient || 0.005;
	    var mieDirectionalG = options.mieDirectionalG || 0.8;

	    var distance = 400000;

	    var sky = new THREE.Sky();
	    sky.scale.setScalar(450000);

	    this.add(sky);

	    var sunSphere = new THREE.Mesh(
	        new THREE.SphereBufferGeometry(20000, 16, 8),
	        new THREE.MeshBasicMaterial({ color: 0xffffff })
	    );

	    sunSphere.position.y = -700000;
	    sunSphere.visible = false;

	    this.add(sunSphere);

	    var uniforms = sky.material.uniforms;
	    uniforms.turbidity.value = turbidity;
	    uniforms.rayleigh.value = rayleigh;
	    uniforms.luminance.value = luminance;
	    uniforms.mieCoefficient.value = mieCoefficient;
	    uniforms.mieDirectionalG.value = mieDirectionalG;
	    var theta = Math.PI * (0.49 - 0.5);
	    var phi = 2 * Math.PI * (0.25 - 0.5);
	    sunSphere.position.x = distance * Math.cos(phi);
	    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
	    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
	    sunSphere.visible = true;
	    uniforms.sunPosition.value.copy(sunSphere.position);

	    this.userData = {
	        type: 'Sky',
	        turbidity: turbidity,
	        rayleigh: rayleigh,
	        luminance: luminance,
	        mieCoefficient: mieCoefficient,
	        mieDirectionalG: mieDirectionalG
	    };
	}

	Sky.prototype = Object.create(THREE.Object3D.prototype);
	Sky.prototype.constructor = Sky;

	/**
	 * SkySerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function SkySerializer() {
	    BaseSerializer.call(this);
	}

	SkySerializer.prototype = Object.create(BaseSerializer.prototype);
	SkySerializer.prototype.constructor = SkySerializer;

	SkySerializer.prototype.toJSON = function (obj) {
	    return Object3DSerializer.prototype.toJSON.call(this, obj);
	};

	SkySerializer.prototype.fromJSON = function (json, parent, camera) {
	    var obj = new Sky(json);

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    return obj;
	};

	/**
	 * 粒子发射器
	 */
	function ParticleEmitter(group, emitter) {
	    THREE.Object3D.call(this);

	    group = group || new SPE.Group({
	        texture: {
	            value: new THREE.TextureLoader().load('assets/textures/SPE/smokeparticle.png')
	        },
	        maxParticleCount: 2000
	    });

	    emitter = emitter || new SPE.Emitter({
	        maxAge: {
	            value: 2
	        },
	        position: {
	            value: new THREE.Vector3(0, 0, 0),
	            spread: new THREE.Vector3(0, 0, 0)
	        },

	        acceleration: {
	            value: new THREE.Vector3(0, -10, 0),
	            spread: new THREE.Vector3(10, 0, 10)
	        },

	        velocity: {
	            value: new THREE.Vector3(0, 25, 0),
	            spread: new THREE.Vector3(10, 7.5, 10)
	        },

	        color: {
	            value: [new THREE.Color('white'), new THREE.Color('red')]
	        },

	        size: {
	            value: 1
	        },

	        particleCount: 2000
	    });

	    group.addEmitter(emitter);

	    group.mesh.name = '粒子';

	    this.add(group.mesh);

	    this.name = '粒子发射器';

	    Object.assign(this.userData, {
	        type: 'ParticleEmitter',
	        group: group,
	        emitter: emitter
	    });
	}

	ParticleEmitter.prototype = Object.create(THREE.Object3D.prototype);
	ParticleEmitter.prototype.constructor = ParticleEmitter;

	/**
	 * ParticleEmitterSerializer
	 * @author tengge / https://github.com/tengge1
	 */
	function ParticleEmitterSerializer() {
	    BaseSerializer.call(this);
	}

	ParticleEmitterSerializer.prototype = Object.create(BaseSerializer.prototype);
	ParticleEmitterSerializer.prototype.constructor = ParticleEmitterSerializer;

	ParticleEmitterSerializer.prototype.toJSON = function (obj) {
	    var json = Object3DSerializer.prototype.toJSON.call(this, obj);

	    json.children.length = 0;

	    var group = json.userData.group;
	    var emitter = json.userData.emitter;

	    json.userData.group = {
	        texture: (new TexturesSerializer()).toJSON(group.texture),
	        maxParticleCount: group.maxParticleCount
	    };

	    json.userData.emitter = {
	        position: {
	            value: {
	                x: emitter.position.value.x,
	                y: emitter.position.value.y,
	                z: emitter.position.value.z
	            },
	            spread: {
	                x: emitter.position.spread.x,
	                y: emitter.position.spread.y,
	                z: emitter.position.spread.z
	            }
	        },
	        velocity: {
	            value: {
	                x: emitter.velocity.value.x,
	                y: emitter.velocity.value.y,
	                z: emitter.velocity.value.z
	            },
	            spread: {
	                x: emitter.velocity.spread.x,
	                y: emitter.velocity.spread.y,
	                z: emitter.velocity.spread.z
	            }
	        },
	        acceleration: {
	            value: {
	                x: emitter.acceleration.value.x,
	                y: emitter.acceleration.value.y,
	                z: emitter.acceleration.value.z
	            },
	            spread: {
	                x: emitter.acceleration.spread.x,
	                y: emitter.acceleration.spread.y,
	                z: emitter.acceleration.spread.z
	            }
	        },
	        color: {
	            value: [
	                emitter.color.value[0].getHex(),
	                emitter.color.value[1].getHex(),
	                emitter.color.value[2].getHex(),
	                emitter.color.value[3].getHex()
	            ]
	        },
	        size: {
	            value: emitter.size.value,
	            spread: emitter.size.spread
	        },
	        particleCount: emitter.particleCount,
	        maxAge: {
	            value: emitter.maxAge.value,
	            spread: emitter.maxAge.spread
	        }
	    };

	    return json;
	};

	ParticleEmitterSerializer.prototype.fromJSON = function (json) {
	    var groupJson = json.userData.group;
	    var emitterJson = json.userData.emitter;

	    var group = new SPE.Group({
	        texture: {
	            value: (new TexturesSerializer()).fromJSON(groupJson.texture)
	        },
	        maxParticleCount: groupJson.maxParticleCount
	    });

	    var emitter = new SPE.Emitter({
	        maxAge: {
	            value: emitterJson.maxAge.value
	        },
	        position: {
	            value: new THREE.Vector3().copy(emitterJson.position.value),
	            spread: new THREE.Vector3().copy(emitterJson.position.spread)
	        },

	        acceleration: {
	            value: new THREE.Vector3().copy(emitterJson.acceleration.value),
	            spread: new THREE.Vector3().copy(emitterJson.acceleration.spread)
	        },

	        velocity: {
	            value: new THREE.Vector3().copy(emitterJson.velocity.value),
	            spread: new THREE.Vector3().copy(emitterJson.velocity.spread)
	        },

	        color: {
	            value: [
	                new THREE.Color(emitterJson.color.value[0]),
	                new THREE.Color(emitterJson.color.value[1]),
	                new THREE.Color(emitterJson.color.value[2]),
	                new THREE.Color(emitterJson.color.value[3])
	            ]
	        },

	        size: {
	            value: emitterJson.size.value.slice(),
	            spread: emitterJson.size.spread.slice()
	        },

	        particleCount: emitterJson.particleCount
	    });

	    var obj = new ParticleEmitter(group, emitter);

	    delete json.userData.group;
	    delete json.userData.emitter;

	    Object3DSerializer.prototype.fromJSON.call(this, json, obj);

	    obj.userData.group.tick(0);

	    return obj;
	};

	/**
	 * 场景序列化/反序列化类
	 * @author tengge / https://github.com/tengge1
	 */
	function Converter() {
	    BaseSerializer.call(this);
	}

	Converter.prototype = Object.create(BaseSerializer.prototype);
	Converter.prototype.constructor = Converter;

	/**
	 * 将应用转为json
	 * @param {*} obj 格式：{ options: options, camera: camera, renderer: renderer, scripts: scripts, scene: scene }
	 */
	Converter.prototype.toJSON = function (obj) {
	    var options = obj.options;
	    var camera = obj.camera;
	    var renderer = obj.renderer;
	    var scripts = obj.scripts;
	    var animation = obj.animation;
	    var scene = obj.scene;

	    var list = [];

	    // 选项
	    var configJson = (new OptionsSerializer()).toJSON(options);
	    list.push(configJson);

	    // 相机
	    var cameraJson = (new CamerasSerializer()).toJSON(camera);
	    list.push(cameraJson);

	    // 渲染器
	    var rendererJson = (new WebGLRendererSerializer()).toJSON(renderer);
	    list.push(rendererJson);

	    // 脚本
	    var scriptsJson = (new ScriptSerializer()).toJSON(scripts);
	    scriptsJson.forEach(n => {
	        list.push(n);
	    });

	    // 动画
	    var animationJson = (new AnimationSerializer()).toJSON(animation);
	    animationJson.forEach(n => {
	        list.push(n);
	    });

	    // 音频监听器
	    var audioListener = camera.children.filter(n => n instanceof THREE.AudioListener)[0];
	    if (audioListener) {
	        var audioListenerJson = (new AudioListenerSerializer()).toJSON(audioListener);
	        list.push(audioListenerJson);
	    }

	    // 场景
	    this.sceneToJson(scene, list);

	    return list;
	};

	/**
	 * 场景转json
	 * @param {*} scene 场景
	 * @param {*} list 用于保存json的空数组
	 */
	Converter.prototype.sceneToJson = function (scene, list) {
	    (function serializer(obj) {
	        var json = null;

	        if (obj.userData.Server === true) { // 服务器对象
	            json = (new ServerObject()).toJSON(obj);
	        } else if (obj.userData.type === 'Sky') {
	            json = (new SkySerializer()).toJSON(obj);
	        } else if (obj.userData.type === 'Fire') { // 火焰
	            json = (new FireSerializer()).toJSON(obj);
	        } else if (obj.userData.type === 'Smoke') { // 烟
	            json = (new SmokeSerializer()).toJSON(obj);
	        } else if (obj.userData.type === 'ParticleEmitter') { // 粒子发射器
	            json = (new ParticleEmitterSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Scene) {
	            json = (new SceneSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Group) {
	            json = (new GroupSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Reflector) {
	            json = (new ReflectorSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Mesh) {
	            json = (new MeshSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Sprite) {
	            json = (new SpriteSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.AmbientLight) {
	            json = (new AmbientLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.DirectionalLight) {
	            json = (new DirectionalLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.HemisphereLight) {
	            json = (new HemisphereLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.PointLight) {
	            json = (new PointLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.RectAreaLight) {
	            json = (new RectAreaLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.SpotLight) {
	            json = (new SpotLightSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Audio) {
	            json = (new AudioSerializer()).toJSON(obj);
	        } else if (obj instanceof THREE.Bone) {
	            json = (new BoneSerializer()).toJSON(obj);
	        }

	        if (json) {
	            list.push(json);
	        } else {
	            console.warn(`Converter: 没有 ${obj.constructor.name} 的序列化器。`);
	        }

	        // 如果obj.userData.type不为空，则为内置类型，其子项不应该序列化
	        if (obj.children && obj.userData.type === undefined) {
	            obj.children.forEach(n => {
	                serializer.call(this, n);
	            });
	        }
	    })(scene);
	};

	/**
	 * 场景反序列化
	 * @param {*} jsons json对象（列表）
	 * @param {*} options 配置选项 格式：{ server: serverUrl } 其中，serverUrl为服务端地址，用于下载模型、纹理等资源
	 */
	Converter.prototype.fromJson = function (jsons, options) {
	    var obj = {
	        options: null,
	        camera: null,
	        renderer: null,
	        scripts: null,
	        animation: null,
	        scene: null
	    };

	    // 选项
	    var optionsJson = jsons.filter(n => n.metadata && n.metadata.generator === 'OptionsSerializer')[0];
	    if (optionsJson) {
	        obj.options = (new OptionsSerializer()).fromJSON(optionsJson);
	    } else {
	        console.warn(`Converter: 场景中不存在配置信息。`);
	    }

	    // 相机
	    var cameraJson = jsons.filter(n => n.metadata && n.metadata.generator.indexOf('CameraSerializer') > -1)[0];
	    if (cameraJson) {
	        obj.camera = (new CamerasSerializer()).fromJSON(cameraJson);
	    } else {
	        console.warn(`Converter: 场景中不存在相机信息。`);
	    }

	    if (options.camera === undefined) {
	        options.camera = obj.camera;
	    }

	    // 渲染器
	    var rendererJson = jsons.filter(n => n.metadata && n.metadata.generator.indexOf('WebGLRendererSerializer') > -1)[0];
	    if (rendererJson) {
	        obj.renderer = (new WebGLRendererSerializer()).fromJSON(rendererJson);
	    } else {
	        console.warn(`Converter: 场景中不存在渲染器信息。`);
	    }

	    if (options.renderer === undefined) {
	        options.renderer = obj.renderer;
	    }

	    // 脚本
	    var scriptJsons = jsons.filter(n => n.metadata && n.metadata.generator === 'ScriptSerializer');
	    if (scriptJsons) {
	        obj.scripts = (new ScriptSerializer()).fromJSON(scriptJsons);
	    }

	    // 动画
	    var animationJsons = jsons.filter(n => n.metadata && n.metadata.generator === 'AnimationSerializer');
	    if (animationJsons) {
	        obj.animation = (new AnimationSerializer()).fromJSON(animationJsons);
	    }

	    // 音频监听器
	    var audioListenerJson = jsons.filter(n => n.metadata && n.metadata.generator === 'AudioListenerSerializer')[0];
	    var audioListener;
	    if (audioListenerJson) {
	        audioListener = (new AudioListenerSerializer()).fromJSON(audioListenerJson);
	    } else {
	        console.warn(`Converter: 场景种不存在音频监听器信息。`);
	        audioListener = new THREE.AudioListener();
	    }
	    obj.audioListener = audioListener;
	    options.audioListener = audioListener;
	    obj.camera.add(audioListener);

	    // 场景
	    return new Promise(resolve => {
	        this.sceneFromJson(jsons, options, audioListener, obj.camera, obj.renderer).then(scene => {
	            obj.scene = scene;
	            resolve(obj);
	        });
	    });
	};

	/**
	 * json转场景
	 * @param {*} jsons 反序列化对象列表
	 * @param {*} options 配置信息
	 */
	Converter.prototype.sceneFromJson = function (jsons, options) {
	    var sceneJson = jsons.filter(n => n.metadata && n.metadata.generator === 'SceneSerializer')[0];
	    if (sceneJson === undefined) {
	        console.warn(`Converter: 数据中不存在场景信息。`);
	        return new Promise(resolve => {
	            resolve(new THREE.Scene());
	        });
	    }

	    var scene = (new SceneSerializer()).fromJSON(sceneJson);

	    var serverObjects = [];

	    (function parseJson(json, parent, list) {
	        json.children.forEach(n => {
	            var objJson = list.filter(o => o.uuid === n)[0];
	            if (objJson == null) {
	                console.warn(`Converter: 数据中不存在uuid为${n}的对象数据。`);
	                return;
	            }

	            if (objJson.userData && objJson.userData.Server === true) { // 服务端对象
	                serverObjects.push({
	                    parent: parent,
	                    json: objJson
	                });
	                return;
	            }

	            var obj = null;

	            switch (objJson.metadata.generator) {
	                case 'SceneSerializer':
	                    obj = (new SceneSerializer()).fromJSON(objJson);
	                    break;
	                case 'GroupSerializer':
	                    obj = (new GroupSerializer()).fromJSON(objJson);
	                    break;
	                case 'ReflectorSerializer':
	                    obj = (new ReflectorSerializer()).fromJSON(objJson);
	                    break;
	                case 'MeshSerializer':
	                    obj = (new MeshSerializer()).fromJSON(objJson);
	                    break;
	                case 'SpriteSerializer':
	                    obj = (new SpriteSerializer()).fromJSON(objJson);
	                    break;
	                case 'AmbientLightSerializer':
	                    obj = (new AmbientLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'DirectionalLightSerializer':
	                    obj = (new DirectionalLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'HemisphereLightSerializer':
	                    obj = (new HemisphereLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'PointLightSerializer':
	                    obj = (new PointLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'RectAreaLightSerializer':
	                    obj = (new RectAreaLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'SpotLightSerializer':
	                    obj = (new SpotLightSerializer()).fromJSON(objJson);
	                    break;
	                case 'AudioSerializer':
	                    obj = (new AudioSerializer()).fromJSON(objJson, undefined, options.audioListener);
	                    break;
	                case 'FireSerializer':
	                    obj = (new FireSerializer()).fromJSON(objJson, undefined, options.camera);
	                    break;
	                case 'SmokeSerializer':
	                    obj = (new SmokeSerializer()).fromJSON(objJson, undefined, options.camera, options.renderer);
	                    break;
	                case 'BoneSerializer':
	                    obj = (new BoneSerializer()).fromJSON(objJson);
	                    break;
	                case 'SkySerializer':
	                    obj = (new SkySerializer()).fromJSON(objJson);
	                    break;
	                case 'ParticleEmitterSerializer':
	                    obj = (new ParticleEmitterSerializer()).fromJSON(objJson);
	                    break;
	            }

	            if (obj) {
	                parent.add(obj);
	            } else {
	                console.warn(`Converter: 不存在${objJson.metadata.type}的反序列化器。`);
	            }

	            // objJson.userData.type不为空，说明它是内置类型，其子项不应该被反序列化
	            if (objJson.userData.type === undefined && objJson.children && Array.isArray(objJson.children) && objJson.children.length > 0 && obj) {
	                parseJson(objJson, obj, list);
	            }
	        });
	    })(sceneJson, scene, jsons);

	    if (serverObjects.length === 0) {
	        return new Promise(resolve => {
	            resolve(scene);
	        });
	    }

	    var promises = serverObjects.map(serverObj => {
	        return new Promise(resolve => {
	            (new ServerObject()).fromJSON(serverObj.json, options).then(obj => {
	                if (obj) {
	                    serverObj.parent.add(obj);
	                } else {
	                    console.warn(`Converter: 服务器资源${serverObj.json.uuid}下载失败。`);
	                }
	                resolve();
	            });
	        });
	    });

	    return new Promise(resolve => {
	        Promise.all(promises).then(() => {
	            resolve(scene);
	        });
	    });
	};

	/**
	 * 动画类型
	 * @author tengge / https://github.com/tengge1
	 */
	var AnimationType = {
	    // 补间动画
	    Tween: 'Tween',

	    // 骨骼动画
	    Skeletal: 'Skeletal',

	    // 音频播放
	    Audio: 'Audio',

	    // 滤镜动画
	    Filter: 'Filter',

	    // 粒子动画
	    Particle: 'Particle'
	};

	var ID$5 = -1;

	/**
	 * 动画数据
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 选项
	 */
	function Animation$1(options) {
	    options = options || {};

	    // 基本信息
	    this.id = options.id || null; // MongoDB _id字段
	    this.uuid = options.uuid || THREE.Math.generateUUID(); // uuid
	    this.name = options.name || `动画${ID$5--}`; // 动画名称
	    this.target = options.target || null; // 动画对象uuid
	    this.type = options.type || AnimationType.Tween; // 动画类型
	    this.beginTime = options.beginTime || 0; // 开始时间（秒）
	    this.endTime = options.endTime || 10; // 结束时间（秒）

	    // 补间动画
	    this.beginStatus = options.beginStatus || 'Current'; // 开始状态（Current、Custom）
	    this.beginPositionX = options.beginPositionX || 0;
	    this.beginPositionY = options.beginPositionY || 0;
	    this.beginPositionZ = options.beginPositionZ || 0;
	    this.beginRotationX = options.beginRotationX || 0;
	    this.beginRotationY = options.beginRotationY || 0;
	    this.beginRotationZ = options.beginRotationZ || 0;
	    this.beginScaleLock = options.beginScaleLock === undefined ? true : options.beginScaleLock;
	    this.beginScaleX = options.beginScaleX || 1.0;
	    this.beginScaleY = options.beginScaleY || 1.0;
	    this.beginScaleZ = options.beginScaleZ || 1.0;
	    this.ease = options.ease || 'linear'; // linear, quadIn, quadOut, quadInOut, cubicIn, cubicOut, cubicInOut, quartIn, quartOut, quartInOut, quintIn, quintOut, quintInOut, sineIn, sineOut, sineInOut, backIn, backOut, backInOut, circIn, circOut, circInOut, bounceIn, bounceOut, bounceInOut, elasticIn, elasticOut, elasticInOut
	    this.endStatus = options.endStatus || 'Current';
	    this.endPositionX = options.endPositionX || 0;
	    this.endPositionY = options.endPositionY || 0;
	    this.endPositionZ = options.endPositionZ || 0;
	    this.endRotationX = options.endRotationX || 0;
	    this.endRotationY = options.endRotationY || 0;
	    this.endRotationZ = options.endRotationZ || 0;
	    this.endScaleLock = options.endScaleLock === undefined ? true : options.endScaleLock;
	    this.endScaleX = options.endScaleX || 1.0;
	    this.endScaleY = options.endScaleY || 1.0;
	    this.endScaleZ = options.endScaleZ || 1.0;
	}

	var ID$6 = 1;

	/**
	 * 动画组
	 * @param {*} options 选项
	 */
	function AnimationGroup(options) {
	    options = options || {};
	    this.id = options.id || null; // MongoDB _id字段
	    this.uuid = options.uuid || THREE.Math.generateUUID(); // uuid
	    this.name = options.name || `组-${ID$6++}`; // 组名
	    this.type = 'AnimationGroup'; // 组类型
	    this.index = options.index || ID$6; // 组序号
	    this.animations = options.animations || []; // 组动画
	}

	/**
	 * 添加
	 * @param {*} animation 
	 */
	AnimationGroup.prototype.add = function (animation) {
	    this.insert(animation, this.animations.length - 1);
	};

	/**
	 * 插入
	 * @param {*} animation 
	 * @param {*} index 
	 */
	AnimationGroup.prototype.insert = function (animation, index = 0) {
	    if (!(animation instanceof Animation$1)) {
	        console.warn(`AnimationGroup: animation不是Animation的实例。`);
	        return;
	    }
	    this.animations.splice(index, 0, animation);
	};

	/**
	 * 移除
	 * @param {*} animation 
	 */
	AnimationGroup.prototype.remove = function (animation) {
	    var index = this.animations.indexOf(animation);
	    this.removeAt(index);
	};

	/**
	 * 移除
	 * @param {*} index 
	 */
	AnimationGroup.prototype.removeAt = function (index) {
	    this.animations.splice(index, 1);
	};

	/**
	 * 场景编辑窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SceneEditWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.callback = options.callback || null;
	}

	SceneEditWindow.prototype = Object.create(UI$1.Control.prototype);
	SceneEditWindow.prototype.constructor = SceneEditWindow;

	SceneEditWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: '编辑场景',
	        width: '320px',
	        height: '280px',
	        shade: true,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '缩略图'
	            }, {
	                xtype: 'imageuploader',
	                id: 'image',
	                scope: this.id,
	                server: this.app.options.server
	            }]
	        }, {
	            xtype: 'row',
	            style: {
	                justifyContent: 'center',
	                marginTop: '8px'
	            },
	            children: [{
	                xtype: 'button',
	                text: '确定',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.save.bind(this)
	            }, {
	                xtype: 'button',
	                text: '取消',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    });
	    container.render();
	};

	SceneEditWindow.prototype.show = function () {
	    UI$1.get('window', this.id).show();
	};

	SceneEditWindow.prototype.hide = function () {
	    UI$1.get('window', this.id).hide();
	};

	SceneEditWindow.prototype.setData = function (data) {
	    this.data = data;
	    this.updateUI();
	};

	SceneEditWindow.prototype.updateUI = function () {
	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);
	    name.setValue(this.data.Name);
	    image.setValue(this.data.Thumbnail);
	};

	SceneEditWindow.prototype.save = function () {
	    var server = this.app.options.server;

	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);

	    Ajax.post(`${server}/api/Scene/Edit`, {
	        ID: this.data.ID,
	        Name: name.getValue(),
	        Image: image.getValue()
	    }, json => {
	        var obj = JSON.parse(json);
	        UI$1.msg(obj.Msg);
	        if (obj.Code === 200) {
	            this.hide();
	            if (typeof (this.callback) === 'function') {
	                this.callback(obj);
	            }
	        }
	    });
	};

	/**
	 * 场景窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SceneWindow(options) {
	    UI$1.ImageListWindow.call(this, options);
	    this.app = options.app;

	    this.title = '场景列表';
	    this.imageIcon = 'icon-scenes';
	    this.preImageUrl = this.app.options.server;
	}

	SceneWindow.prototype = Object.create(UI$1.ImageListWindow.prototype);
	SceneWindow.prototype.constructor = SceneWindow;

	SceneWindow.prototype.beforeUpdateList = function () {
	    var server = this.app.options.server;

	    return new Promise(resolve => {
	        Ajax.getJson(`${server}/api/Scene/List`, obj => {
	            resolve(obj.Data);
	        });
	    });
	};

	SceneWindow.prototype.onClick = function (data) {
	    var app = this.app;
	    var editor = app.editor;
	    var server = app.options.server;
	    document.title = data.Name;

	    Ajax.get(`${server}/api/Scene/Scene_${data.ID}`, (json) => {
	        var obj = JSON.parse(json);
	        if (obj.Code === 200) {
	            this.hide();
	        }

	        editor.clear(false);

	        (new Converter()).fromJson(obj.Data, {
	            server: this.app.options.server,
	            camera: this.app.editor.camera
	        }).then(obj => {
	            this.onLoadScene(obj);

	            editor.sceneID = data.ID;
	            editor.sceneName = data.Name;
	            document.title = data.Name;

	            // 添加帮助器
	            editor.scene.traverse(n => {
	                editor.addHelper(n);
	            });

	            if (obj.options) {
	                this.app.call('optionsChanged', this, this.app.options);
	            }

	            if (obj.scripts) {
	                this.app.call('scriptChanged', this);
	            }

	            if (obj.animation) {
	                this.app.editor.animation.setAnimationGroups(obj.animation.map(n => {
	                    return new AnimationGroup({
	                        id: n.id,
	                        uuid: n.uuid,
	                        name: n.name,
	                        index: n.index,
	                        animations: n.animations.map(m => {
	                            return new Animation$1({
	                                // 基本信息
	                                id: m.id,
	                                uuid: m.uuid,
	                                name: m.name,
	                                target: m.target,
	                                type: m.type,
	                                beginTime: m.beginTime,
	                                endTime: m.endTime,

	                                // 补间动画
	                                beginStatus: m.beginStatus,
	                                beginPositionX: m.beginPositionX,
	                                beginPositionY: m.beginPositionY,
	                                beginPositionZ: m.beginPositionZ,
	                                beginRotationX: m.beginRotationX,
	                                beginRotationY: m.beginRotationY,
	                                beginRotationZ: m.beginRotationZ,
	                                beginScaleLock: m.beginScaleLock,
	                                beginScaleX: m.beginScaleX,
	                                beginScaleY: m.beginScaleY,
	                                beginScaleZ: m.beginScaleZ,
	                                ease: m.ease,
	                                endStatus: m.endStatus,
	                                endPositionX: m.endPositionX,
	                                endPositionY: m.endPositionY,
	                                endPositionZ: m.endPositionZ,
	                                endRotationX: m.endRotationX,
	                                endRotationY: m.endRotationY,
	                                endRotationZ: m.endRotationZ,
	                                endScaleLock: m.endScaleLock,
	                                endScaleX: m.endScaleX,
	                                endScaleY: m.endScaleY,
	                                endScaleZ: m.endScaleZ
	                            })
	                        })
	                    })
	                }));
	                this.app.call('animationChanged', this);
	            }

	            if (obj.scene) {
	                this.app.call('sceneGraphChanged', this);
	            }

	            UI$1.msg('载入成功！');
	        });
	    });
	};

	SceneWindow.prototype.onLoadScene = function (obj) {
	    if (obj.options) {
	        Object.assign(this.app.options, obj.options);
	    }

	    if (obj.camera) {
	        this.app.editor.camera.copy(obj.camera);

	        this.app.editor.camera.children.forEach(n => {
	            if (n instanceof THREE.AudioListener) {
	                this.app.editor.camera.remove(n);
	            }
	        });

	        var audioListener = obj.camera.children.filter(n => n instanceof THREE.AudioListener)[0];
	        if (audioListener) {
	            this.app.editor.audioListener = audioListener;
	            this.app.editor.camera.add(audioListener);
	        }
	    }

	    if (obj.renderer) {
	        var viewport = this.app.viewport.container.dom;
	        var oldRenderer = this.app.editor.renderer;

	        viewport.removeChild(oldRenderer.domElement);
	        viewport.appendChild(obj.renderer.domElement);
	        this.app.editor.renderer = obj.renderer;
	        this.app.editor.renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
	        this.app.call('resize', this);
	    }

	    if (obj.scripts) {
	        Object.assign(this.app.editor.scripts, obj.scripts);
	    }

	    if (obj.scene) {
	        this.app.editor.setScene(obj.scene);
	    }

	    this.app.editor.camera.updateProjectionMatrix();
	};

	SceneWindow.prototype.onEdit = function (data) {
	    if (this.editWindow === undefined) {
	        this.editWindow = new SceneEditWindow({
	            app: this.app,
	            parent: this.parent,
	            callback: this.update.bind(this)
	        });
	        this.editWindow.render();
	    }
	    this.editWindow.setData(data);
	    this.editWindow.show();
	};

	SceneWindow.prototype.onDelete = function (data) {
	    var server = this.app.options.server;

	    UI$1.confirm('询问', `是否删除场景${data.Name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${server}/api/Scene/Delete?ID=${data.ID}`, json => {
	                var obj = JSON.parse(json);
	                if (obj.Code === 200) {
	                    this.update();
	                }
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * 场景菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SceneMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	SceneMenu.prototype = Object.create(UI$1.Control.prototype);
	SceneMenu.prototype.constructor = SceneMenu;

	SceneMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '场景'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '新建',
	                cls: 'option',
	                onClick: this.newScene.bind(this)
	            }, {
	                xtype: 'div',
	                html: '载入',
	                cls: 'option',
	                onClick: this.loadScene.bind(this)
	            }, {
	                xtype: 'div',
	                html: '保存',
	                cls: 'option',
	                onClick: this.saveScene.bind(this)
	            }, {
	                xtype: 'div',
	                html: '另存为',
	                cls: 'option',
	                onClick: this.saveAsScene.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                html: '发布静态网站',
	                cls: 'option',
	                onClick: this.publish.bind(this)
	            }]
	        }]
	    });

	    container.render();

	    // this.link = document.createElement('a');
	    // this.link.style.display = 'none';
	    // document.body.appendChild(this.link); // Firefox workaround, see #6594
	};

	// ---------------------------- 新建场景 ---------------------------------

	SceneMenu.prototype.newScene = function () {
	    var editor = this.app.editor;

	    if (editor.sceneName == null) {
	        editor.clear();
	        document.title = '未命名';
	        return;
	    }

	    UI$1.confirm('询问', '所有未保存数据将丢失，确定要新建场景吗？', function (event, btn) {
	        if (btn === 'ok') {
	            editor.clear();
	            editor.sceneID = null;
	            editor.sceneName = null;
	            document.title = '未命名';
	        }
	    });
	};

	// --------------------------- 载入场景 --------------------------------------

	SceneMenu.prototype.loadScene = function () {
	    if (this.window == null) {
	        this.window = new SceneWindow({ app: this.app });
	        this.window.render();
	    }
	    this.window.show();
	};

	// --------------------------- 保存场景 ----------------------------------------

	SceneMenu.prototype.saveScene = function () { // 保存场景
	    var editor = this.app.editor;
	    var sceneName = editor.sceneName;

	    if (sceneName == null) {
	        UI$1.prompt('保存场景', '名称', '新场景', (event, name) => {
	            this.commitSave(name);
	        });
	    } else {
	        this.commitSave(sceneName);
	    }
	};

	SceneMenu.prototype.commitSave = function (sceneName) {
	    var editor = this.app.editor;

	    var obj = (new Converter()).toJSON({
	        options: this.app.options,
	        camera: editor.camera,
	        renderer: editor.renderer,
	        scripts: editor.scripts,
	        animation: editor.animation,
	        scene: editor.scene
	    });

	    Ajax.post(`${this.app.options.server}/api/Scene/Save`, {
	        Name: sceneName,
	        Data: JSON.stringify(obj)
	    }, function (result) {
	        var obj = JSON.parse(result);

	        if (obj.Code === 200) {
	            editor.sceneID = obj.ID;
	            editor.sceneName = sceneName;
	            document.title = sceneName;
	        }

	        UI$1.msg(obj.Msg);
	    });
	};

	// --------------------------- 另存为场景 -------------------------------------

	SceneMenu.prototype.saveAsScene = function () {
	    var sceneName = this.app.editor.sceneName;

	    if (sceneName == null) {
	        sceneName = '新场景';
	    }

	    UI$1.prompt('保存场景', '名称', sceneName, (event, name) => {
	        this.app.editor.sceneName = name;
	        document.title = name;
	        this.commitSaveAs(name);
	    });
	};

	SceneMenu.prototype.commitSaveAs = function (sceneName) {
	    var editor = this.app.editor;

	    var obj = (new Converter()).toJSON({
	        options: this.app.options,
	        camera: editor.camera,
	        renderer: editor.renderer,
	        scripts: editor.scripts,
	        animation: editor.animation,
	        scene: editor.scene
	    });

	    Ajax.post(`${this.app.options.server}/api/Scene/Save`, {
	        Name: sceneName,
	        Data: JSON.stringify(obj)
	    }, function (result) {
	        var obj = JSON.parse(result);

	        if (obj.Code === 200) {
	            editor.sceneID = obj.ID;
	            editor.sceneName = sceneName;
	            document.title = sceneName;
	        }

	        UI$1.msg(obj.Msg);
	    });
	};

	// ------------------------- 发布静态网站 ------------------------------

	SceneMenu.prototype.publish = function () {
	    UI$1.confirm('发布网站', '是否把所有场景、资源发布为静态网站？', (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${this.app.options.server}/api/Publish/Publish`, function (result) {
	                var obj = JSON.parse(result);
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * 编辑菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function EditMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	EditMenu.prototype = Object.create(UI$1.Control.prototype);
	EditMenu.prototype.constructor = EditMenu;

	EditMenu.prototype.render = function () {

	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '编辑'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                id: 'undo',
	                scope: this.id,
	                html: '撤销(Ctrl+Z)',
	                cls: 'option inactive',
	                onClick: this.undo.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'redo',
	                scope: this.id,
	                html: '重做(Ctrl+Shift+Z)',
	                cls: 'option inactive',
	                onClick: this.redo.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'clearHistory',
	                scope: this.id,
	                html: '清空历史记录',
	                cls: 'option inactive',
	                onClick: this.clearHistory.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                id: 'clone',
	                scope: this.id,
	                html: '复制',
	                cls: 'option inactive',
	                onClick: this.clone.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'delete',
	                scope: this.id,
	                html: '删除(Del)',
	                cls: 'option inactive',
	                onClick: this.delete.bind(this)
	            }]
	        }]
	    });

	    container.render();

	    this.app.on(`historyChanged.${this.id}`, this.onHistoryChanged.bind(this));
	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	};

	// --------------------- 撤销 --------------------------

	EditMenu.prototype.undo = function () {
	    var history = this.app.editor.history;
	    if (history.undos.length === 0) {
	        return;
	    }

	    this.app.editor.undo();
	};

	// --------------------- 重做 -----------------------------

	EditMenu.prototype.redo = function () {
	    var history = this.app.editor.history;
	    if (history.redos.length === 0) {
	        return;
	    }

	    this.app.editor.redo();
	};

	// -------------------- 清空历史记录 --------------------------------

	EditMenu.prototype.clearHistory = function () {
	    var editor = this.app.editor;
	    var history = editor.history;

	    if (history.undos.length === 0 && history.redos.length === 0) {
	        return;
	    }

	    UI$1.confirm('询问', '撤销/重做历史记录将被清空。确定吗？', function (event, btn) {
	        if (btn === 'ok') {
	            editor.history.clear();
	        }
	    });
	};

	// -------------------------- 复制 -----------------------------------

	EditMenu.prototype.clone = function () {
	    var editor = this.app.editor;
	    var object = editor.selected;

	    if (object == null || object.parent == null) { // 避免复制场景或相机
	        return;
	    }

	    object = object.clone();
	    editor.execute(new AddObjectCommand(object));
	};

	// ----------------------- 删除 -----------------------------------

	EditMenu.prototype.delete = function () {
	    var editor = this.app.editor;
	    var object = editor.selected;

	    if (object == null || object.parent == null) { // 避免删除场景或相机
	        return;
	    }

	    UI$1.confirm('询问', '删除 ' + object.name + '?', function (event, btn) {
	        if (btn === 'ok') {
	            editor.execute(new RemoveObjectCommand(object));
	        }
	    });
	};

	// ---------------------- 事件 -----------------------

	EditMenu.prototype.onHistoryChanged = function () {
	    var history = this.app.editor.history;

	    var undo = UI$1.get('undo', this.id);
	    var redo = UI$1.get('redo', this.id);
	    var clearHistory = UI$1.get('clearHistory', this.id);

	    if (history.undos.length === 0) {
	        undo.dom.classList.add('inactive');
	    } else {
	        undo.dom.classList.remove('inactive');
	    }

	    if (history.redos.length === 0) {
	        redo.dom.classList.add('inactive');
	    } else {
	        redo.dom.classList.remove('inactive');
	    }

	    if (history.undos.length === 0 && history.redos.length === 0) {
	        clearHistory.dom.classList.add('inactive');
	    } else {
	        clearHistory.dom.classList.remove('inactive');
	    }
	};

	EditMenu.prototype.onObjectSelected = function () {
	    var editor = this.app.editor;

	    var clone = UI$1.get('clone', this.id);
	    var deleteBtn = UI$1.get('delete', this.id);

	    if (editor.selected && editor.selected.parent != null) {
	        clone.dom.classList.remove('inactive');
	        deleteBtn.dom.classList.remove('inactive');
	    } else {
	        clone.dom.classList.add('inactive');
	        deleteBtn.dom.classList.add('inactive');
	    }
	};

	/**
	 * 组
	 */
	function Group() {
	    THREE.Object3D.call(this);
	    this.name = '组';
	}

	Group.prototype = Object.create(THREE.Object3D.prototype);
	Group.prototype.constructor = Group;

	/**
	 * 平板
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Plane(geometry = new THREE.PlaneBufferGeometry(50, 50), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '平板';
	    this.rotation.x = -Math.PI / 2;
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Plane.prototype = Object.create(THREE.Mesh.prototype);
	Plane.prototype.constructor = Plane;

	/**
	 * 正方体
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Box(geometry = new THREE.BoxBufferGeometry(1, 1, 1), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '正方体';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Box.prototype = Object.create(THREE.Mesh.prototype);
	Box.prototype.constructor = Box;

	/**
	 * 圆
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Circle(geometry = new THREE.CircleBufferGeometry(1, 32), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '圆';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Circle.prototype = Object.create(THREE.Mesh.prototype);
	Circle.prototype.constructor = Circle;

	/**
	 * 圆柱体
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Cylinder(geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 32, 1, false), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '圆柱体';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Cylinder.prototype = Object.create(THREE.Mesh.prototype);
	Cylinder.prototype.constructor = Cylinder;

	/**
	 * 球体
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Sphere(geometry = new THREE.SphereBufferGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '球体';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Sphere.prototype = Object.create(THREE.Mesh.prototype);
	Sphere.prototype.constructor = Sphere;

	/**
	 * 二十面体
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Icosahedron(geometry = new THREE.IcosahedronBufferGeometry(1, 2), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '二十面体';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Icosahedron.prototype = Object.create(THREE.Mesh.prototype);
	Icosahedron.prototype.constructor = Icosahedron;

	/**
	 * 轮胎
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Torus(geometry = new THREE.TorusBufferGeometry(2, 1, 32, 32, Math.PI * 2), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '轮胎';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Torus.prototype = Object.create(THREE.Mesh.prototype);
	Torus.prototype.constructor = Torus;

	/**
	 * 纽结
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function TorusKnot(geometry = new THREE.TorusKnotBufferGeometry(2, 0.8, 64, 12, 2, 3), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '纽结';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	TorusKnot.prototype = Object.create(THREE.Mesh.prototype);
	TorusKnot.prototype.constructor = TorusKnot;

	/**
	 * 茶壶
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Teapot(geometry = new THREE.TeapotBufferGeometry(3, 10, true, true, true, true, true), material = new THREE.MeshStandardMaterial()) {
	    THREE.Mesh.call(this, geometry, material);

	    // 修改TeapotBufferGeometry类型错误问题，原来是BufferGeometry
	    geometry.type = 'TeapotBufferGeometry';

	    // 修复TeapotBufferGeometry缺少parameters参数问题
	    geometry.parameters = {
	        size: 3,
	        segments: 10,
	        bottom: true,
	        lid: true,
	        body: true,
	        fitLid: true,
	        blinn: true
	    };

	    this.name = '茶壶';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Teapot.prototype = Object.create(THREE.Mesh.prototype);
	Teapot.prototype.constructor = Teapot;

	var points = [
	    new THREE.Vector2(0, 0),
	    new THREE.Vector2(4, 0),
	    new THREE.Vector2(3.5, 0.5),
	    new THREE.Vector2(1, 0.75),
	    new THREE.Vector2(0.8, 1),
	    new THREE.Vector2(0.8, 4),
	    new THREE.Vector2(1, 4.2),
	    new THREE.Vector2(1.4, 4.8),
	    new THREE.Vector2(2, 5),
	    new THREE.Vector2(2.5, 5.4),
	    new THREE.Vector2(3, 12)
	];

	/**
	 * 酒杯
	 * @param {*} geometry 几何体
	 * @param {*} material 材质
	 */
	function Lathe(geometry = new THREE.LatheBufferGeometry(points, 20, 0, 2 * Math.PI), material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })) {
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '酒杯';
	    this.castShadow = true;
	    this.receiveShadow = true;
	}

	Lathe.prototype = Object.create(THREE.Mesh.prototype);
	Lathe.prototype.constructor = Lathe;

	/**
	 * 精灵
	 * @param {*} material 材质
	 */
	function Sprite(material = new THREE.SpriteMaterial()) {
	    THREE.Sprite.call(this, material);

	    this.name = '精灵';
	}

	Sprite.prototype = Object.create(THREE.Sprite.prototype);
	Sprite.prototype.constructor = Sprite;

	var link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link); // Firefox workaround, see #6594

	/**
	 * 将数字凑成2的指数次幂
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 * @param {*} num 数字
	 */
	function makePowOfTwo(num) {
	    var result = 1;
	    while (result < num) {
	        result = result * 2;
	    }
	    return result;
	}

	function save(blob, filename) {
	    link.href = URL.createObjectURL(blob);
	    link.download = filename || 'data.json';
	    link.click();
	    // URL.revokeObjectURL( url ); breaks Firefox...
	}

	/**
	 * 下载字符串文件
	 * @param {*} text 
	 * @param {*} filename 
	 */
	function saveString(text, filename) {
	    save(new Blob([text], { type: 'text/plain' }), filename);
	}

	const StringUtils = {
	    makePowOfTwo: makePowOfTwo,
	    save: save,
	    saveString: saveString
	};

	/**
	 * 文本
	 * @param {*} text 文字
	 */
	function Text$1(text = '文字') {
	    var canvas = document.createElement('canvas');

	    var fontSize = 64;

	    var ctx = canvas.getContext('2d');
	    ctx.font = `${fontSize}px sans-serif`;

	    var textMetrics = ctx.measureText(text);
	    canvas.width = StringUtils.makePowOfTwo(textMetrics.width);
	    canvas.height = fontSize;
	    ctx.textBaseline = 'hanging';
	    ctx.font = `${fontSize}px sans-serif`; // 重新设置画布大小，前面设置的ctx属性全部失效

	    ctx.fillStyle = 'rgba(0,0,0,0)';
	    ctx.fillRect(0, 0, canvas.width, canvas.height);
	    ctx.fillStyle = 'rgba(255,255,255,1)';
	    ctx.fillText(text, (canvas.width - textMetrics.width) / 2, 0);

	    var map = new THREE.CanvasTexture(canvas);

	    var geometry = new THREE.PlaneBufferGeometry(canvas.width / 10, canvas.height / 10);
	    var material = new THREE.MeshBasicMaterial({
	        color: 0xffffff,
	        map: map,
	        transparent: true
	    });

	    THREE.Mesh.call(this, geometry, material);

	    this.name = text;
	}

	Text$1.prototype = Object.create(THREE.Mesh.prototype);
	Text$1.prototype.constructor = Text$1;

	/**
	 * 几何体菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function GeometryMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	GeometryMenu.prototype = Object.create(UI$1.Control.prototype);
	GeometryMenu.prototype.constructor = GeometryMenu;

	GeometryMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '几何体'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '组',
	                cls: 'option',
	                onClick: this.addGroup.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                html: '平板',
	                cls: 'option',
	                onClick: this.addPlane.bind(this)
	            }, {
	                xtype: 'div',
	                html: '正方体',
	                cls: 'option',
	                onClick: this.addBox.bind(this)
	            }, {
	                xtype: 'div',
	                html: '圆',
	                cls: 'option',
	                onClick: this.addCircle.bind(this)
	            }, {
	                xtype: 'div',
	                html: '圆柱体',
	                cls: 'option',
	                onClick: this.addCylinder.bind(this)
	            }, {
	                xtype: 'div',
	                html: '球体',
	                cls: 'option',
	                onClick: this.addSphere.bind(this)
	            }, {
	                xtype: 'div',
	                html: '二十面体',
	                cls: 'option',
	                onClick: this.addIcosahedron.bind(this)
	            }, {
	                xtype: 'div',
	                html: '轮胎',
	                cls: 'option',
	                onClick: this.addTorus.bind(this)
	            }, {
	                xtype: 'div',
	                html: '扭结',
	                cls: 'option',
	                onClick: this.addTorusKnot.bind(this)
	            }, {
	                xtype: 'div',
	                html: '茶壶',
	                cls: 'option',
	                onClick: this.addTeaport.bind(this)
	            }, {
	                xtype: 'div',
	                html: '酒杯',
	                cls: 'option',
	                onClick: this.addLathe.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'mAddSprite',
	                html: '精灵',
	                cls: 'option',
	                onClick: this.addSprite.bind(this)
	            }, {
	                xtype: 'div',
	                html: '文本',
	                cls: 'option',
	                onClick: this.addText.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// ------------------------- 组 ---------------------------------

	GeometryMenu.prototype.addGroup = function () {
	    this.app.editor.execute(new AddObjectCommand(new Group()));
	};

	// ------------------------- 平板 -------------------------------

	GeometryMenu.prototype.addPlane = function () {
	    this.app.editor.execute(new AddObjectCommand(new Plane()));
	};

	// ------------------------ 正方体 -----------------------------

	GeometryMenu.prototype.addBox = function () {
	    this.app.editor.execute(new AddObjectCommand(new Box()));
	};

	// ------------------------ 圆 ----------------------------------

	GeometryMenu.prototype.addCircle = function () {
	    this.app.editor.execute(new AddObjectCommand(new Circle()));
	};

	// ------------------------圆柱体 -------------------------------

	GeometryMenu.prototype.addCylinder = function () {
	    this.app.editor.execute(new AddObjectCommand(new Cylinder()));
	};

	// ------------------------ 球体 -------------------------------

	GeometryMenu.prototype.addSphere = function () {
	    this.app.editor.execute(new AddObjectCommand(new Sphere()));
	};

	// ----------------------- 二十面体 -----------------------------

	GeometryMenu.prototype.addIcosahedron = function () {
	    this.app.editor.execute(new AddObjectCommand(new Icosahedron()));
	};

	// ----------------------- 轮胎 ---------------------------------

	GeometryMenu.prototype.addTorus = function () {
	    this.app.editor.execute(new AddObjectCommand(new Torus()));
	};

	// ----------------------- 纽结 ---------------------------------

	GeometryMenu.prototype.addTorusKnot = function () {
	    this.app.editor.execute(new AddObjectCommand(new TorusKnot()));
	};

	// ---------------------- 茶壶 ----------------------------------

	GeometryMenu.prototype.addTeaport = function () {
	    this.app.editor.execute(new AddObjectCommand(new Teapot()));
	};

	// ---------------------- 酒杯 ----------------------------------

	GeometryMenu.prototype.addLathe = function () {
	    this.app.editor.execute(new AddObjectCommand(new Lathe()));
	};

	// ---------------------- 精灵 -----------------------------------

	GeometryMenu.prototype.addSprite = function () {
	    this.app.editor.execute(new AddObjectCommand(new Sprite()));
	};

	// ---------------------- 文本 ----------------------------------

	GeometryMenu.prototype.addText = function () {
	    UI$1.prompt('请输入', null, '一些文字', (event, value) => {
	        this.app.editor.execute(new AddObjectCommand(new Text$1(value)));
	    });
	};

	/**
	 * 点光源
	 */
	function PointLight(color, intensity, distance, decay) {
	    THREE.PointLight.call(this, color, intensity, distance, decay);

	    var geometry = new THREE.SphereBufferGeometry(0.2, 16, 8);
	    var material = new THREE.MeshBasicMaterial({
	        color: color
	    });
	    var mesh = new THREE.Mesh(geometry, material);

	    // 帮助器
	    mesh.name = '帮助器';
	    mesh.userData.type = 'helper';

	    this.add(mesh);

	    // 光晕
	    var textureLoader = new THREE.TextureLoader();
	    var textureFlare0 = textureLoader.load('assets/textures/lensflare/lensflare0.png');
	    var textureFlare3 = textureLoader.load('assets/textures/lensflare/lensflare3.png');

	    // 光晕
	    var lensflare = new THREE.Lensflare();
	    lensflare.addElement(new THREE.LensflareElement(textureFlare0, 40, 0.01, new THREE.Color(color)));
	    lensflare.addElement(new THREE.LensflareElement(textureFlare3, 60, 0.2));
	    lensflare.addElement(new THREE.LensflareElement(textureFlare3, 35, 0.4));
	    lensflare.addElement(new THREE.LensflareElement(textureFlare3, 60, 0.6));
	    lensflare.addElement(new THREE.LensflareElement(textureFlare3, 45, 0.8));

	    lensflare.name = '光晕';
	    lensflare.userData.type = 'lensflare';

	    this.add(lensflare);
	}

	PointLight.prototype = Object.create(THREE.PointLight.prototype);
	PointLight.prototype.constructor = PointLight;

	var vertexShader$1 = "varying vec3 vWorldPosition;\r\n\r\nvoid main() {\r\n\tvec4 worldPosition = modelMatrix * vec4(position, 1.0);\r\n\tvWorldPosition = worldPosition.xyz;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

	var fragmentShader$1 = "uniform vec3 topColor;\r\nuniform vec3 bottomColor;\r\nuniform float offset;\r\nuniform float exponent;\r\n\r\nvarying vec3 vWorldPosition;\r\n\r\nvoid main() {\r\n\tfloat h = normalize(vWorldPosition + offset).y;\r\n\tgl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h , 0.0), exponent), 0.0)), 1.0);\r\n}";

	/**
	 * 半球光
	 * @param {*} skyColor 
	 * @param {*} groundColor 
	 * @param {*} intensity 
	 */
	function HemisphereLight(skyColor, groundColor, intensity) {
	    THREE.HemisphereLight.call(this, skyColor, groundColor, intensity);

	    var uniforms = {
	        topColor: { value: new THREE.Color(skyColor) },
	        bottomColor: { value: new THREE.Color(groundColor) },
	        offset: { value: 33 },
	        exponent: { value: 0.6 }
	    };

	    var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
	    var skyMat = new THREE.ShaderMaterial({
	        vertexShader: vertexShader$1,
	        fragmentShader: fragmentShader$1,
	        uniforms: uniforms,
	        side: THREE.BackSide
	    });

	    var sky = new THREE.Mesh(skyGeo, skyMat);
	    sky.name = '天空';
	    sky.userData.type = 'sky';

	    this.add(sky);
	}

	HemisphereLight.prototype = Object.create(THREE.HemisphereLight.prototype);
	HemisphereLight.prototype.constructor = HemisphereLight;

	/**
	 * 点光源
	 */
	function RectAreaLight(color, intensity, width, height) {
	    THREE.RectAreaLight.call(this, color, intensity, width, height);

	    // 正面
	    var rectLightMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial());
	    rectLightMesh.scale.x = width;
	    rectLightMesh.scale.y = height;

	    rectLightMesh.name = '正面';
	    rectLightMesh.userData.type = 'frontSide';

	    this.add(rectLightMesh);

	    var rectLightMeshBack = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x080808 }));
	    rectLightMeshBack.scale.x = width;
	    rectLightMeshBack.scale.y = height;
	    rectLightMeshBack.rotation.y = Math.PI;

	    rectLightMesh.name = '背面';
	    rectLightMesh.userData.type = 'backSide';

	    this.add(rectLightMeshBack);
	}

	RectAreaLight.prototype = Object.create(THREE.RectAreaLight.prototype);
	RectAreaLight.prototype.constructor = RectAreaLight;

	/**
	 * 光源菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function LightMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	LightMenu.prototype = Object.create(UI$1.Control.prototype);
	LightMenu.prototype.constructor = LightMenu;

	LightMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '光源'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '环境光',
	                cls: 'option',
	                onClick: this.addAmbientLight.bind(this)
	            }, {
	                xtype: 'div',
	                html: '平行光',
	                cls: 'option',
	                onClick: this.addDirectionalLight.bind(this)
	            }, {
	                xtype: 'div',
	                html: '点光源',
	                cls: 'option',
	                onClick: this.addPointLight.bind(this)
	            }, {
	                xtype: 'div',
	                html: '聚光灯',
	                cls: 'option',
	                onClick: this.addSpotLight.bind(this)
	            }, {
	                xtype: 'div',
	                html: '半球光',
	                cls: 'option',
	                onClick: this.addHemisphereLight.bind(this)
	            }, {
	                xtype: 'div',
	                html: '矩形光',
	                cls: 'option',
	                onClick: this.addRectAreaLight.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// ------------------------- 环境光 ------------------------------

	LightMenu.prototype.addAmbientLight = function () {
	    var editor = this.app.editor;

	    var color = 0xaaaaaa;

	    var light = new THREE.AmbientLight(color);
	    light.name = '环境光';

	    editor.execute(new AddObjectCommand(light));
	};

	// ------------------------- 平行光 ------------------------------

	LightMenu.prototype.addDirectionalLight = function () {
	    var editor = this.app.editor;

	    var color = 0xffffff;
	    var intensity = 1;

	    var light = new THREE.DirectionalLight(color, intensity);
	    light.name = '平行光';
	    light.castShadow = true;
	    light.shadow.mapSize.x = 2048;
	    light.shadow.mapSize.y = 2048;
	    light.shadow.camera.left = -100;
	    light.shadow.camera.right = 100;
	    light.shadow.camera.top = 100;
	    light.shadow.camera.bottom = -100;
	    light.position.set(5, 10, 7.5);

	    editor.execute(new AddObjectCommand(light));
	};

	// ------------------------- 点光源 ------------------------------

	LightMenu.prototype.addPointLight = function () {
	    var editor = this.app.editor;

	    var color = 0xffffff;
	    var intensity = 1;
	    var distance = 0;

	    var light = new PointLight(color, intensity, distance);
	    light.name = '点光源';
	    light.position.y = 5;
	    light.castShadow = true;

	    editor.execute(new AddObjectCommand(light));
	};

	// ------------------------- 聚光灯 ------------------------------

	LightMenu.prototype.addSpotLight = function () {
	    var editor = this.app.editor;

	    var color = 0xffffff;
	    var intensity = 1;
	    var distance = 0;
	    var angle = Math.PI * 0.1;
	    var penumbra = 0;

	    var light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);

	    light.name = '聚光灯';
	    light.castShadow = true;

	    light.position.set(5, 10, 7.5);

	    editor.execute(new AddObjectCommand(light));
	};

	// ------------------------- 半球光 ------------------------------

	LightMenu.prototype.addHemisphereLight = function () {
	    var editor = this.app.editor;
	    var skyColor = 0x00aaff;
	    var groundColor = 0xffaa00;
	    var intensity = 1;

	    var light = new HemisphereLight(skyColor, groundColor, intensity);
	    light.name = '半球光';

	    light.position.set(0, 10, 0);

	    editor.execute(new AddObjectCommand(light));
	};

	// ------------------------- 矩形光 ------------------------------

	LightMenu.prototype.addRectAreaLight = function () {
	    var editor = this.app.editor;

	    var color = 0xffffff;
	    var intensity = 1;
	    var width = 20;
	    var height = 10;

	    var light = new RectAreaLight(color, intensity, width, height);
	    light.name = '矩形光';

	    light.position.set(0, 6, 0);

	    editor.execute(new AddObjectCommand(light));
	};

	/**
	 * 模型编辑窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ModelEditWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.callback = options.callback || null;
	}

	ModelEditWindow.prototype = Object.create(UI$1.Control.prototype);
	ModelEditWindow.prototype.constructor = ModelEditWindow;

	ModelEditWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: '编辑模型',
	        width: '320px',
	        height: '280px',
	        shade: true,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '缩略图'
	            }, {
	                xtype: 'imageuploader',
	                id: 'image',
	                scope: this.id,
	                server: this.app.options.server
	            }]
	        }, {
	            xtype: 'row',
	            style: {
	                justifyContent: 'center',
	                marginTop: '8px'
	            },
	            children: [{
	                xtype: 'button',
	                text: '确定',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.save.bind(this)
	            }, {
	                xtype: 'button',
	                text: '取消',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    });
	    container.render();
	};

	ModelEditWindow.prototype.show = function () {
	    UI$1.get('window', this.id).show();
	};

	ModelEditWindow.prototype.hide = function () {
	    UI$1.get('window', this.id).hide();
	};

	ModelEditWindow.prototype.setData = function (data) {
	    this.data = data;
	    this.updateUI();
	};

	ModelEditWindow.prototype.updateUI = function () {
	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);
	    name.setValue(this.data.Name);
	    image.setValue(this.data.Thumbnail);
	};

	ModelEditWindow.prototype.save = function () {
	    var server = this.app.options.server;

	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);

	    Ajax.post(`${server}/api/Mesh/Edit`, {
	        ID: this.data.ID,
	        Name: name.getValue(),
	        Image: image.getValue()
	    }, json => {
	        var obj = JSON.parse(json);
	        UI$1.msg(obj.Msg);
	        if (obj.Code === 200) {
	            this.hide();
	            if (typeof (this.callback) === 'function') {
	                this.callback(obj);
	            }
	        }
	    });
	};

	/**
	 * 模型窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ModelWindow(options) {
	    UI$1.ImageListWindow.call(this, options);
	    this.app = options.app;

	    this.title = '模型列表';
	    this.imageIcon = 'icon-model';
	    this.cornerTextField = 'Type';
	    this.uploadUrl = `${this.app.options.server}/api/Mesh/Add`;
	    this.preImageUrl = this.app.options.server;
	    this.showUploadButton = true;
	}

	ModelWindow.prototype = Object.create(UI$1.ImageListWindow.prototype);
	ModelWindow.prototype.constructor = ModelWindow;

	ModelWindow.prototype.beforeUpdateList = function () {
	    var server = this.app.options.server;

	    return new Promise(resolve => {
	        Ajax.getJson(`${server}/api/Mesh/List`, obj => {
	            resolve(obj.Data);
	        });
	    });
	};

	ModelWindow.prototype.onUpload = function (obj) {
	    this.update();
	    UI$1.msg(obj.Msg);
	};

	ModelWindow.prototype.onClick = function (model) {
	    var loader = new ModelLoader(this.app);

	    var url = model.Url;

	    if (model.Url.indexOf(';') > -1) { // 包含多个入口文件
	        url = url.split(';').map(n => this.app.options.server + n);
	    } else {
	        url = this.app.options.server + model.Url;
	    }

	    loader.load(url, model).then(obj => {
	        if (!obj) {
	            return;
	        }
	        obj.name = model.Name;

	        Object.assign(obj.userData, model, {
	            Server: true
	        });

	        var cmd = new AddObjectCommand(obj);
	        cmd.execute();

	        if (obj.userData.scripts) {
	            obj.userData.scripts.forEach(n => {
	                this.app.editor.scripts[n.uuid] = n;
	            });
	            this.app.call('scriptChanged', this);
	        }
	    });
	};

	ModelWindow.prototype.onEdit = function (data) {
	    if (this.editWindow === undefined) {
	        this.editWindow = new ModelEditWindow({
	            app: this.app,
	            parent: this.parent,
	            callback: this.update.bind(this)
	        });
	        this.editWindow.render();
	    }
	    this.editWindow.setData(data);
	    this.editWindow.show();
	};

	ModelWindow.prototype.onDelete = function (data) {
	    var server = this.app.options.server;

	    UI$1.confirm('询问', `是否删除模型${data.Name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${server}/api/Mesh/Delete?ID=${data.ID}`, json => {
	                var obj = JSON.parse(json);
	                if (obj.Code === 200) {
	                    this.update();
	                }
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * 纹理编辑窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextureEditWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.callback = options.callback || null;
	}

	TextureEditWindow.prototype = Object.create(UI$1.Control.prototype);
	TextureEditWindow.prototype.constructor = TextureEditWindow;

	TextureEditWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: '编辑纹理',
	        width: '320px',
	        height: '280px',
	        shade: true,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            style: {
	                justifyContent: 'center',
	                marginTop: '8px'
	            },
	            children: [{
	                xtype: 'button',
	                text: '确定',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.save.bind(this)
	            }, {
	                xtype: 'button',
	                text: '取消',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    });
	    container.render();
	};

	TextureEditWindow.prototype.show = function () {
	    UI$1.get('window', this.id).show();
	};

	TextureEditWindow.prototype.hide = function () {
	    UI$1.get('window', this.id).hide();
	};

	TextureEditWindow.prototype.setData = function (data) {
	    this.data = data;
	    this.updateUI();
	};

	TextureEditWindow.prototype.updateUI = function () {
	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    name.setValue(this.data.Name);
	};

	TextureEditWindow.prototype.save = function () {
	    var server = this.app.options.server;

	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);

	    Ajax.post(`${server}/api/Texture/Edit`, {
	        ID: this.data.ID,
	        Name: name.getValue()
	    }, json => {
	        var obj = JSON.parse(json);
	        UI$1.msg(obj.Msg);
	        if (obj.Code === 200) {
	            this.hide();
	            if (typeof (this.callback) === 'function') {
	                this.callback(obj);
	            }
	        }
	    });
	};

	/**
	 * 纹理窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextureWindow(options) {
	    UI$1.ImageListWindow.call(this, options);
	    this.app = options.app;

	    this.title = '纹理列表';

	    this.imageIcon = 'icon-texture';
	    // this.cornerTextField = 'Type';
	    this.uploadUrl = `${this.app.options.server}/api/Texture/Add`;
	    this.preImageUrl = this.app.options.server;
	    this.showUploadButton = true;

	    this.onSelect = options.onSelect || null;
	}

	TextureWindow.prototype = Object.create(UI$1.ImageListWindow.prototype);
	TextureWindow.prototype.constructor = TextureWindow;

	TextureWindow.prototype.beforeUpdateList = function () {
	    var server = this.app.options.server;

	    return new Promise(resolve => {
	        Ajax.getJson(`${server}/api/Texture/List`, obj => {
	            resolve(obj.Data);
	        });
	    });
	};

	TextureWindow.prototype.onUpload = function (obj) {
	    this.update();
	    UI$1.msg(obj.Msg);
	};

	TextureWindow.prototype.onClick = function (data) {
	    if (typeof (this.onSelect) === 'function') {
	        this.onSelect(data);
	    } else {
	        UI$1.msg('请在材质控件中修改纹理。');
	    }
	};

	TextureWindow.prototype.onEdit = function (data) {
	    if (this.editWindow === undefined) {
	        this.editWindow = new TextureEditWindow({
	            app: this.app,
	            parent: this.parent,
	            callback: this.update.bind(this)
	        });
	        this.editWindow.render();
	    }
	    this.editWindow.setData(data);
	    this.editWindow.show();
	};

	TextureWindow.prototype.onDelete = function (data) {
	    var server = this.app.options.server;

	    UI$1.confirm('询问', `是否删除纹理${data.Name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${server}/api/Texture/Delete?ID=${data.ID}`, json => {
	                var obj = JSON.parse(json);
	                if (obj.Code === 200) {
	                    this.update();
	                }
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * 音频编辑窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function AudioEditWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.callback = options.callback || null;
	}

	AudioEditWindow.prototype = Object.create(UI$1.Control.prototype);
	AudioEditWindow.prototype.constructor = AudioEditWindow;

	AudioEditWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: '编辑音频',
	        width: '320px',
	        height: '280px',
	        shade: true,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            style: {
	                justifyContent: 'center',
	                marginTop: '8px'
	            },
	            children: [{
	                xtype: 'button',
	                text: '确定',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.save.bind(this)
	            }, {
	                xtype: 'button',
	                text: '取消',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    });
	    container.render();
	};

	AudioEditWindow.prototype.show = function () {
	    UI$1.get('window', this.id).show();
	};

	AudioEditWindow.prototype.hide = function () {
	    UI$1.get('window', this.id).hide();
	};

	AudioEditWindow.prototype.setData = function (data) {
	    this.data = data;
	    this.updateUI();
	};

	AudioEditWindow.prototype.updateUI = function () {
	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    name.setValue(this.data.Name);
	};

	AudioEditWindow.prototype.save = function () {
	    var server = this.app.options.server;

	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);

	    Ajax.post(`${server}/api/Audio/Edit`, {
	        ID: this.data.ID,
	        Name: name.getValue()
	    }, json => {
	        var obj = JSON.parse(json);
	        UI$1.msg(obj.Msg);
	        if (obj.Code === 200) {
	            this.hide();
	            if (typeof (this.callback) === 'function') {
	                this.callback(obj);
	            }
	        }
	    });
	};

	/**
	 * 纹理窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function AudioWindow(options) {
	    UI$1.ImageListWindow.call(this, options);
	    this.app = options.app;

	    this.title = '音频列表';
	    this.imageIcon = 'icon-audio';
	    // this.cornerTextField = 'Type';
	    this.uploadUrl = `${this.app.options.server}/api/Audio/Add`;
	    this.preImageUrl = this.app.options.server;
	    this.showUploadButton = true;

	    this.onSelect = options.onSelect || null;
	}

	AudioWindow.prototype = Object.create(UI$1.ImageListWindow.prototype);
	AudioWindow.prototype.constructor = AudioWindow;

	AudioWindow.prototype.beforeUpdateList = function () {
	    var server = this.app.options.server;

	    return new Promise(resolve => {
	        Ajax.getJson(`${server}/api/Audio/List`, obj => {
	            resolve(obj.Data);
	        });
	    });
	};

	AudioWindow.prototype.onUpload = function (obj) {
	    this.update();
	    UI$1.msg(obj.Msg);
	};

	AudioWindow.prototype.onClick = function (data) {
	    if (typeof (this.onSelect) === 'function') {
	        this.onSelect(data);
	    } else {
	        UI$1.msg('请在音频相关控件中修改音乐。');
	    }
	};

	AudioWindow.prototype.onEdit = function (data) {
	    if (this.editWindow === undefined) {
	        this.editWindow = new AudioEditWindow({
	            app: this.app,
	            parent: this.parent,
	            callback: this.update.bind(this)
	        });
	        this.editWindow.render();
	    }
	    this.editWindow.setData(data);
	    this.editWindow.show();
	};

	AudioWindow.prototype.onDelete = function (data) {
	    var server = this.app.options.server;

	    UI$1.confirm('询问', `是否删除音频${data.Name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${server}/api/Audio/Delete?ID=${data.ID}`, json => {
	                var obj = JSON.parse(json);
	                if (obj.Code === 200) {
	                    this.update();
	                }
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * MMD编辑窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function MMDEditWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.callback = options.callback || null;
	}

	MMDEditWindow.prototype = Object.create(UI$1.Control.prototype);
	MMDEditWindow.prototype.constructor = MMDEditWindow;

	MMDEditWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'window',
	        scope: this.id,
	        parent: this.parent,
	        title: '编辑MMD',
	        width: '320px',
	        height: '280px',
	        shade: true,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '缩略图'
	            }, {
	                xtype: 'imageuploader',
	                id: 'image',
	                scope: this.id,
	                server: this.app.options.server
	            }]
	        }, {
	            xtype: 'row',
	            style: {
	                justifyContent: 'center',
	                marginTop: '8px'
	            },
	            children: [{
	                xtype: 'button',
	                text: '确定',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.save.bind(this)
	            }, {
	                xtype: 'button',
	                text: '取消',
	                style: {
	                    margin: '0 8px'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    });
	    container.render();
	};

	MMDEditWindow.prototype.show = function () {
	    UI$1.get('window', this.id).show();
	};

	MMDEditWindow.prototype.hide = function () {
	    UI$1.get('window', this.id).hide();
	};

	MMDEditWindow.prototype.setData = function (data) {
	    this.data = data;
	    this.updateUI();
	};

	MMDEditWindow.prototype.updateUI = function () {
	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);
	    name.setValue(this.data.Name);
	    image.setValue(this.data.Thumbnail);
	};

	MMDEditWindow.prototype.save = function () {
	    var server = this.app.options.server;

	    if (this.data === undefined) {
	        return;
	    }

	    var name = UI$1.get('name', this.id);
	    var image = UI$1.get('image', this.id);

	    Ajax.post(`${server}/api/MMD/Edit`, {
	        ID: this.data.ID,
	        Name: name.getValue(),
	        Image: image.getValue()
	    }, json => {
	        var obj = JSON.parse(json);
	        UI$1.msg(obj.Msg);
	        if (obj.Code === 200) {
	            this.hide();
	            if (typeof (this.callback) === 'function') {
	                this.callback(obj);
	            }
	        }
	    });
	};

	/**
	 * MMD窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function MMDWindow(options) {
	    UI$1.ImageListWindow.call(this, options);
	    this.app = options.app;

	    this.title = 'MMD资源列表';
	    this.imageIcon = 'icon-model';
	    this.cornerTextField = 'Type';
	    this.uploadUrl = `${this.app.options.server}/api/MMD/Add`;
	    this.preImageUrl = this.app.options.server;
	    this.showUploadButton = true;

	    this.onSelect = options.onSelect || null;
	}

	MMDWindow.prototype = Object.create(UI$1.ImageListWindow.prototype);
	MMDWindow.prototype.constructor = MMDWindow;

	MMDWindow.prototype.beforeUpdateList = function () {
	    var server = this.app.options.server;

	    return new Promise(resolve => {
	        Ajax.getJson(`${server}/api/MMD/List`, obj => {
	            resolve(obj.Data);
	        });
	    });
	};

	MMDWindow.prototype.onUpload = function (obj) {
	    this.update();
	    UI$1.msg(obj.Msg);
	};

	MMDWindow.prototype.onClick = function (model) {
	    if (model.Type === 'vmd') {
	        if (this.onSelect) {
	            this.onSelect(model);
	        } else {
	            UI$1.msg(`无法将动画文件添加到场景。`);
	        }
	        return;
	    }

	    var loader = new ModelLoader(this.app);

	    var url = model.Url;

	    if (model.Url.indexOf(';') > -1) { // 包含多个入口文件
	        url = url.split(';').map(n => this.app.options.server + n);
	    } else {
	        url = this.app.options.server + model.Url;
	    }

	    loader.load(url, model).then(obj => {
	        if (!obj) {
	            return;
	        }
	        obj.name = model.Name;

	        Object.assign(obj.userData, model, {
	            Server: true
	        });

	        var cmd = new AddObjectCommand(obj);
	        cmd.execute();

	        if (obj.userData.scripts) {
	            obj.userData.scripts.forEach(n => {
	                this.app.editor.scripts[n.uuid] = n;
	            });
	            this.app.call('scriptChanged', this);
	        }

	        this.hide();
	    });
	};

	MMDWindow.prototype.onEdit = function (data) {
	    if (this.editWindow === undefined) {
	        this.editWindow = new MMDEditWindow({
	            app: this.app,
	            parent: this.parent,
	            callback: this.update.bind(this)
	        });
	        this.editWindow.render();
	    }
	    this.editWindow.setData(data);
	    this.editWindow.show();
	};

	MMDWindow.prototype.onDelete = function (data) {
	    var server = this.app.options.server;

	    UI$1.confirm('询问', `是否删除MMD资源${data.Name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            Ajax.post(`${server}/api/MMD/Delete?ID=${data.ID}`, json => {
	                var obj = JSON.parse(json);
	                if (obj.Code === 200) {
	                    this.update();
	                }
	                UI$1.msg(obj.Msg);
	            });
	        }
	    });
	};

	/**
	 * 资源菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function AssetMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	AssetMenu.prototype = Object.create(UI$1.Control.prototype);
	AssetMenu.prototype.constructor = AssetMenu;

	AssetMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '资源'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '模型管理',
	                cls: 'option',
	                onClick: this.onManageModel.bind(this)
	            }, {
	                xtype: 'div',
	                html: '纹理管理',
	                cls: 'option',
	                onClick: this.onManageTexture.bind(this)
	            }, {
	                xtype: 'div',
	                html: '音频管理',
	                cls: 'option',
	                onClick: this.onManageAudio.bind(this)
	            }, {
	                xtype: 'div',
	                html: 'MMD资源管理',
	                cls: 'option',
	                onClick: this.onManageMMD.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                html: '导出几何体',
	                cls: 'option',
	                onClick: this.onExportGeometry.bind(this)
	            }, {
	                xtype: 'div',
	                html: '导出物体',
	                cls: 'option',
	                onClick: this.onExportObject.bind(this)
	            }, {
	                xtype: 'div',
	                html: '导出场景',
	                cls: 'option',
	                onClick: this.onExportScene.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                html: '导出gltf文件',
	                cls: 'option',
	                onClick: this.onExportGLTF.bind(this)
	            }, {
	                xtype: 'div',
	                html: '导出obj文件',
	                cls: 'option',
	                onClick: this.onExportOBJ.bind(this)
	            }, {
	                xtype: 'div',
	                html: '导出ply文件',
	                cls: 'option',
	                onClick: this.onExportPLY.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'mExportSTLB',
	                html: '导出stl二进制文件',
	                cls: 'option',
	                onClick: this.onExportSTLB.bind(this)
	            }, {
	                xtype: 'div',
	                id: 'mExportSTL',
	                html: '导出stl文件',
	                cls: 'option',
	                onClick: this.onExportSTL.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// --------------------------------- 模型管理 --------------------------------------

	AssetMenu.prototype.onManageModel = function () {
	    if (this.modelWindow == null) {
	        this.modelWindow = new ModelWindow({ parent: this.app.container, app: this.app });
	        this.modelWindow.render();
	    }
	    this.modelWindow.show();
	};

	// --------------------------------- 纹理管理 --------------------------------------

	AssetMenu.prototype.onManageTexture = function () {
	    if (this.textureWindow == null) {
	        this.textureWindow = new TextureWindow({ parent: this.app.container, app: this.app });
	        this.textureWindow.render();
	    }
	    this.textureWindow.show();
	};

	// --------------------------------- 音频管理 --------------------------------------

	AssetMenu.prototype.onManageAudio = function () {
	    if (this.audioWindow == null) {
	        this.audioWindow = new AudioWindow({ parent: this.app.container, app: this.app });
	        this.audioWindow.render();
	    }
	    this.audioWindow.show();
	};

	// ------------------------------- MMD资源管理 --------------------------------------

	AssetMenu.prototype.onManageMMD = function () {
	    if (this.mmdWindow == null) {
	        this.mmdWindow = new MMDWindow({ parent: this.app.container, app: this.app });
	        this.mmdWindow.render();
	    }
	    this.mmdWindow.show();
	};

	// ------------------------------- 导出几何体 ----------------------------------------

	AssetMenu.prototype.onExportGeometry = function () {
	    var editor = this.app.editor;

	    var object = editor.selected;

	    if (object === null) {
	        UI$1.msg('请选择物体');
	        return;
	    }

	    var geometry = object.geometry;

	    if (geometry === undefined) {
	        UI$1.msg('选中的对象不具有Geometry属性。');
	        return;
	    }

	    var output = geometry.toJSON();

	    try {
	        output = JSON.stringify(output, parseNumber, '\t');
	        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
	    } catch (e) {
	        output = JSON.stringify(output);
	    }

	    StringUtils.saveString(output, 'geometry.json');
	};

	// ------------------------------- 导出物体 ------------------------------------------

	AssetMenu.prototype.onExportObject = function () {
	    var editor = this.app.editor;

	    var object = editor.selected;

	    if (object === null) {
	        UI$1.msg('请选择对象');
	        return;
	    }

	    var output = object.toJSON();

	    try {
	        output = JSON.stringify(output, parseNumber, '\t');
	        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
	    } catch (e) {
	        output = JSON.stringify(output);
	    }

	    StringUtils.saveString(output, 'model.json');
	};

	// ------------------------------- 导出场景 ------------------------------------------

	AssetMenu.prototype.onExportScene = function () {
	    var editor = this.app.editor;

	    var output = editor.scene.toJSON();

	    try {
	        output = JSON.stringify(output, parseNumber, '\t');
	        output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
	    } catch (e) {
	        output = JSON.stringify(output);
	    }

	    StringUtils.saveString(output, 'scene.json');
	};

	// ------------------------------ 导出gltf文件 ----------------------------------------

	AssetMenu.prototype.onExportGLTF = function () {
	    var exporter = new THREE.GLTFExporter();

	    exporter.parse(app.editor.scene, function (result) {
	        StringUtils.saveString(JSON.stringify(result), 'model.gltf');
	    });
	};

	// ------------------------------ 导出obj文件 -----------------------------------------

	AssetMenu.prototype.onExportOBJ = function () {
	    var editor = this.app.editor;

	    var object = editor.selected;

	    if (object === null) {
	        UI$1.msg('请选择对象');
	        return;
	    }

	    var exporter = new THREE.OBJExporter();
	    StringUtils.saveString(exporter.parse(object), 'model.obj');
	};

	// ------------------------------- 导出ply文件 ----------------------------------------

	AssetMenu.prototype.onExportPLY = function () {
	    var editor = this.app.editor;

	    var object = editor.selected;

	    if (object === null) {
	        UI$1.msg('请选择对象');
	        return;
	    }

	    var exporter = new THREE.PLYExporter();
	    StringUtils.saveString(exporter.parse(object, {
	        excludeAttributes: ['normal', 'uv', 'color', 'index']
	    }), 'model.ply');
	};

	// ------------------------------- 导出stl二进制文件 -----------------------------------

	AssetMenu.prototype.onExportSTLB = function () {
	    var editor = this.app.editor;

	    var exporter = new THREE.STLBinaryExporter();

	    StringUtils.saveString(exporter.parse(editor.scene), 'model.stl');
	};

	// ------------------------------- 导出stl文件 -----------------------------------------

	AssetMenu.prototype.onExportSTL = function () {
	    var editor = this.app.editor;

	    var exporter = new THREE.STLExporter();

	    StringUtils.saveString(exporter.parse(editor.scene), 'model.stl');
	};

	/**
	 * 地形
	 * @param {*} width 地形宽度
	 * @param {*} depth 地形高度
	 */
	function Terrain(width = 256, depth = 256) {

	    // 创建高程贴图
	    var data = this.generateHeight(width, depth);

	    // 创建地形几何体
	    var geometry = new THREE.PlaneBufferGeometry(7500, 7500, width - 1, depth - 1);
	    geometry.rotateX(-Math.PI / 2);

	    var vertices = geometry.attributes.position.array;

	    for (var i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {
	        vertices[j + 1] = data[i] * 10;
	    }

	    geometry.computeFaceNormals();

	    // 创建颜色贴图
	    var texture = new THREE.CanvasTexture(this.generateTexture(data, width, depth));
	    texture.wrapS = THREE.ClampToEdgeWrapping;
	    texture.wrapT = THREE.ClampToEdgeWrapping;

	    // 创建网格
	    THREE.Mesh.call(this, geometry, new THREE.MeshLambertMaterial({ map: texture }));

	    this.name = '地形';
	    this.scale.set(0.01, 0.01, 0.01);
	}

	Terrain.prototype = Object.create(THREE.Mesh.prototype);
	Terrain.prototype.constructor = Terrain;

	Terrain.prototype.generateHeight = function (width, height) {
	    var size = width * height,
	        data = new Uint8Array(size),
	        perlin = new ImprovedNoise(),
	        quality = 1;

	    for (var j = 0; j < 4; j++) {
	        for (var i = 0; i < size; i++) {
	            var x = i % width, y = ~~(i / width);
	            data[i] += Math.abs(perlin.noise(x / quality, y / quality, 0) * quality);
	        }
	        quality *= 5;
	    }

	    return data;
	};

	Terrain.prototype.generateTexture = function (data, width, height) {
	    // bake lighting into texture
	    var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

	    vector3 = new THREE.Vector3(0, 0, 0);

	    sun = new THREE.Vector3(1, 1, 1);
	    sun.normalize();

	    canvas = document.createElement('canvas');
	    canvas.width = width;
	    canvas.height = height;

	    context = canvas.getContext('2d');
	    context.fillStyle = '#000';
	    context.fillRect(0, 0, width, height);

	    image = context.getImageData(0, 0, canvas.width, canvas.height);
	    imageData = image.data;

	    for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
	        vector3.x = data[j - 2] - data[j + 2];
	        vector3.y = 2;
	        vector3.z = data[j - width * 2] - data[j + width * 2];
	        vector3.normalize();
	        shade = vector3.dot(sun);
	        imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
	        imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
	        imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
	    }

	    context.putImageData(image, 0, 0);

	    // Scaled 4x
	    canvasScaled = document.createElement('canvas');
	    canvasScaled.width = width * 4;
	    canvasScaled.height = height * 4;

	    context = canvasScaled.getContext('2d');
	    context.scale(4, 4);
	    context.drawImage(canvas, 0, 0);

	    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
	    imageData = image.data;

	    for (var i = 0, l = imageData.length; i < l; i += 4) {
	        var v = ~ ~(Math.random() * 5);
	        imageData[i] += v;
	        imageData[i + 1] += v;
	        imageData[i + 2] += v;
	    }

	    context.putImageData(image, 0, 0);
	    return canvasScaled;
	};

	var HeightVertexShader = "varying vec2 vUv;\r\nuniform vec2 scale;\r\nuniform vec2 offset;\r\n\r\nvoid main( void ) {\r\n    vUv = uv * scale + offset;\r\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\r\n}";

	var HeightFragmentShader = "//\r\n// Description : Array and textureless GLSL 3D simplex noise function.\r\n//      Author : Ian McEwan, Ashima Arts.\r\n//  Maintainer : ijm\r\n//     Lastmod : 20110409 (stegu)\r\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\r\n//               Distributed under the MIT License. See LICENSE file.\r\n//\r\nuniform float time;\r\nvarying vec2 vUv;\r\n\r\nvec4 permute( vec4 x ) {\r\n\treturn mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );\r\n}\r\n\r\nvec4 taylorInvSqrt( vec4 r ) {\r\n\treturn 1.79284291400159 - 0.85373472095314 * r;\r\n}\r\n\r\nfloat snoise( vec3 v ) {\r\n\tconst vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );\r\n\tconst vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );\r\n\t// First corner\r\n\tvec3 i  = floor( v + dot( v, C.yyy ) );\r\n\tvec3 x0 = v - i + dot( i, C.xxx );\r\n\t// Other corners\r\n\tvec3 g = step( x0.yzx, x0.xyz );\r\n\tvec3 l = 1.0 - g;\r\n\tvec3 i1 = min( g.xyz, l.zxy );\r\n\tvec3 i2 = max( g.xyz, l.zxy );\r\n\tvec3 x1 = x0 - i1 + 1.0 * C.xxx;\r\n\tvec3 x2 = x0 - i2 + 2.0 * C.xxx;\r\n\tvec3 x3 = x0 - 1. + 3.0 * C.xxx;\r\n\t// Permutations\r\n\ti = mod( i, 289.0 );\r\n\tvec4 p = permute( permute( permute(\r\n\t\t\t i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )\r\n\t\t   + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )\r\n\t\t   + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );\r\n\t// Gradients\r\n\t// ( N*N points uniformly over a square, mapped onto an octahedron.)\r\n\tfloat n_ = 1.0 / 7.0; // N=7\r\n\tvec3 ns = n_ * D.wyz - D.xzx;\r\n\tvec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)\r\n\tvec4 x_ = floor( j * ns.z );\r\n\tvec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)\r\n\tvec4 x = x_ *ns.x + ns.yyyy;\r\n\tvec4 y = y_ *ns.x + ns.yyyy;\r\n\tvec4 h = 1.0 - abs( x ) - abs( y );\r\n\tvec4 b0 = vec4( x.xy, y.xy );\r\n\tvec4 b1 = vec4( x.zw, y.zw );\r\n\tvec4 s0 = floor( b0 ) * 2.0 + 1.0;\r\n\tvec4 s1 = floor( b1 ) * 2.0 + 1.0;\r\n\tvec4 sh = -step( h, vec4( 0.0 ) );\r\n\tvec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\r\n\tvec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\r\n\tvec3 p0 = vec3( a0.xy, h.x );\r\n\tvec3 p1 = vec3( a0.zw, h.y );\r\n\tvec3 p2 = vec3( a1.xy, h.z );\r\n\tvec3 p3 = vec3( a1.zw, h.w );\r\n\t// Normalise gradients\r\n\tvec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );\r\n\tp0 *= norm.x;\r\n\tp1 *= norm.y;\r\n\tp2 *= norm.z;\r\n\tp3 *= norm.w;\r\n\t// Mix final noise value\r\n\tvec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );\r\n\tm = m * m;\r\n\treturn 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),\r\n\t\t\t\t\t\t\t\t  dot( p2, x2 ), dot( p3, x3 ) ) );\r\n}\r\n\r\nfloat surface3( vec3 coord ) {\r\n\tfloat n = 0.0;\r\n\tn += 1.0 * abs( snoise( coord ) );\r\n\tn += 0.5 * abs( snoise( coord * 2.0 ) );\r\n\tn += 0.25 * abs( snoise( coord * 4.0 ) );\r\n\tn += 0.125 * abs( snoise( coord * 8.0 ) );\r\n\treturn n;\r\n}\r\n\r\nvoid main( void ) {\r\n\tvec3 coord = vec3( vUv, -time );\r\n\tfloat n = surface3( coord );\r\n\tgl_FragColor = vec4( vec3( n, n, n ), 1.0 );\r\n}";

	/**
	 * 着色器地形
	 * @param {*} renderer 渲染器
	 * @param {*} options 参数
	 */
	function ShaderTerrain(renderer, options) {
	    var width = options.width || window.innerWidth; // 画布宽度
	    var height = options.height || window.innerHeight; // 画布高度

	    // 地形参数
	    var rx = 256, ry = 256, // 分辨率
	        animDelta = 0, // 动画间隔
	        animDeltaDir = -1, // 动画方向
	        lightDir = 1; // 光源方向

	    // 场景
	    var scene = new THREE.Scene();

	    // 相机
	    var camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000);
	    camera.position.z = 100;
	    scene.add(camera);

	    // 高程贴图
	    var heightMap = new THREE.WebGLRenderTarget(rx, ry, {
	        minFilter: THREE.LinearFilter,
	        magFilter: THREE.LinearFilter,
	        format: THREE.RGBFormat
	    });
	    heightMap.texture.generateMipmaps = false;

	    // 法线贴图
	    var normalMap = new THREE.WebGLRenderTarget(rx, ry, {
	        minFilter: THREE.LinearFilter,
	        magFilter: THREE.LinearFilter,
	        format: THREE.RGBFormat
	    });
	    normalMap.texture.generateMipmaps = false;

	    // 高光贴图
	    var specularMap = new THREE.WebGLRenderTarget(2048, 2048, {
	        minFilter: THREE.LinearFilter,
	        magFilter: THREE.LinearFilter,
	        format: THREE.RGBFormat
	    });
	    specularMap.texture.generateMipmaps = false;

	    // 下载纹理
	    var loadingManager = new THREE.LoadingManager(() => {
	        this.visible = true;
	    });

	    var textureLoader = new THREE.TextureLoader(loadingManager);

	    var diffuseTexture1 = textureLoader.load("assets/textures/terrain/grasslight-big.jpg"); // 漫反射纹理1
	    var diffuseTexture2 = textureLoader.load("assets/textures/terrain/backgrounddetailed6.jpg"); // 漫反射纹理2
	    var detailTexture = textureLoader.load("assets/textures/terrain/grasslight-big-nm.jpg"); // 细节纹理

	    diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
	    diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
	    detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;

	    // 创建高程材质
	    var heightUniforms = {
	        time: { value: 1.0 },
	        scale: { value: new THREE.Vector2(1.5, 1.5) },
	        offset: { value: new THREE.Vector2(0, 0) }
	    };

	    var hightMaterial = this.createShaderMaterial(HeightVertexShader, HeightFragmentShader, heightUniforms, false);

	    // 创建法线材质
	    var normalUniforms = THREE.UniformsUtils.clone(THREE.NormalMapShader.uniforms);
	    normalUniforms.height.value = 0.05;
	    normalUniforms.resolution.value.set(rx, ry);
	    normalUniforms.heightMap.value = heightMap.texture;

	    var normalMaterial = this.createShaderMaterial(THREE.NormalMapShader.vertexShader, THREE.NormalMapShader.fragmentShader, normalUniforms, false);

	    // 创建地形材质
	    var terrainShader = THREE.ShaderTerrain["terrain"];

	    var terrainUniforms = THREE.UniformsUtils.clone(terrainShader.uniforms);

	    terrainUniforms['tDisplacement'].value = heightMap.texture; // 位移贴图
	    terrainUniforms['uDisplacementScale'].value = 375; // 位移贴图缩放

	    terrainUniforms['tNormal'].value = normalMap.texture; // 法线贴图
	    terrainUniforms['uNormalScale'].value = 3.5; // 法线贴图缩放

	    terrainUniforms['specular'].value.setHex(0xffffff); // 高光颜色
	    terrainUniforms['diffuse'].value.setHex(0xffffff); // 漫反射颜色
	    terrainUniforms['shininess'].value = 30; // 光泽

	    terrainUniforms['tSpecular'].value = specularMap.texture; // 高光贴图
	    terrainUniforms['enableSpecular'].value = true; // 是否启用高光贴图

	    terrainUniforms['tDiffuse1'].value = diffuseTexture1; // 漫反射纹理1
	    terrainUniforms['enableDiffuse1'].value = true; // 是否启用漫反射纹理1

	    terrainUniforms['tDiffuse2'].value = diffuseTexture2; // 漫反射纹理2
	    terrainUniforms['enableDiffuse2'].value = true; // 是否启用漫反射纹理2

	    terrainUniforms['tDetail'].value = detailTexture; // 细节纹理
	    terrainUniforms['uRepeatOverlay'].value.set(6, 6); // 重复叠加次数

	    var terrainMaterial = this.createShaderMaterial(terrainShader.vertexShader, terrainShader.fragmentShader, terrainUniforms, true);

	    // 贴图生成渲染目标
	    var quadTarget = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), new THREE.MeshBasicMaterial({ color: 0x000000 }));
	    quadTarget.position.z = -500;
	    scene.add(quadTarget);

	    // 创建网格
	    var geometry = new THREE.PlaneBufferGeometry(6000, 6000, 256, 256);
	    THREE.BufferGeometryUtils.computeTangents(geometry);

	    THREE.Mesh.call(this, geometry, terrainMaterial);

	    this.name = '地形';
	    this.position.set(0, -30, 0);
	    this.rotation.x = -Math.PI / 2;
	    this.scale.set(0.1, 0.1, 0.1);

	    // 动画函数
	    function update(deltaTime) {
	        if (!this.visible) {
	            return;
	        }

	        var fLow = 0.1,
	            fHigh = 0.8;

	        var lightVal = THREE.Math.clamp(lightVal + 0.5 * deltaTime * lightDir, fLow, fHigh);
	        var valNorm = (lightVal - fLow) / (fHigh - fLow);

	        terrainUniforms['uNormalScale'].value = THREE.Math.mapLinear(valNorm, 0, 1, 0.6, 3.5);

	        animDelta = THREE.Math.clamp(animDelta + 0.00075 * animDeltaDir, 0, 0.05);
	        heightUniforms['time'].value += deltaTime * animDelta;
	        heightUniforms['offset'].value.x += deltaTime * 0.05;

	        // 生成高程贴图
	        quadTarget.material = hightMaterial;
	        renderer.render(scene, camera, heightMap, true);

	        // 生成法线贴图
	        quadTarget.material = normalMaterial;
	        renderer.render(scene, camera, normalMap, true);
	    }
	    this.update = update.bind(this);
	}

	ShaderTerrain.prototype = Object.create(THREE.Mesh.prototype);
	ShaderTerrain.prototype.constructor = ShaderTerrain;

	/**
	 * 创建着色器材质
	 * @param {*} vertexShader 顶点着色器
	 * @param {*} fragmentShader 片源着色器
	 * @param {*} uniforms 变量
	 * @param {*} lights 是否使用光源
	 */
	ShaderTerrain.prototype.createShaderMaterial = function (vertexShader, fragmentShader, uniforms, lights) {
	    return new THREE.ShaderMaterial({
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader,
	        uniforms: uniforms,
	        lights: lights,
	        fog: true
	    });
	};

	/**
	 * 物理地形
	 */
	function PhysicsTerrain() {
	    // 灰阶高度参数
	    var terrainWidthExtents = 100; // 地形宽度范围
	    var terrainDepthExtents = 100; // 地形深度范围
	    var terrainWidth = 128; // 地形宽度
	    var terrainDepth = 128; // 地形深度
	    var terrainMinHeight = -2;
	    var terrainMaxHeight = 8;

	    // 创建几何体
	    var geometry = new THREE.PlaneBufferGeometry(terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1);
	    geometry.rotateX(-Math.PI / 2);

	    var vertices = geometry.attributes.position.array;

	    var heightData = this.generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight);

	    for (var i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {
	        // j + 1 because it is the y component that we modify
	        vertices[j + 1] = heightData[i];
	    }

	    geometry.computeVertexNormals();

	    // 创建材质
	    var material = new THREE.MeshPhongMaterial({
	        color: 0xC7C7C7
	    });

	    // 创建网格
	    THREE.Mesh.call(this, geometry, material);

	    this.name = '地形';
	    this.castShadow = true;
	    this.receiveShadow = true;

	    // 下载贴图
	    var loader = new THREE.TextureLoader();
	    loader.load(`assets/textures/grid.png`, texture => {
	        texture.wrapS = THREE.RepeatWrapping;
	        texture.wrapT = THREE.RepeatWrapping;
	        texture.repeat.set(terrainWidth - 1, terrainDepth - 1);
	        material.map = texture;
	        material.needsUpdate = true;
	    });

	    // 物理
	    var mass = 0;
	    var position = this.position;
	    var quaternion = this.quaternion;

	    var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
	    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
	    var state = new Ammo.btDefaultMotionState(transform);

	    var shape = this.createTerrainShape(terrainWidth, terrainDepth, terrainWidthExtents, terrainDepthExtents, heightData, terrainMinHeight, terrainMaxHeight);

	    var localInertia = new Ammo.btVector3(0, 0, 0);

	    var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, state, shape, localInertia));

	    this.userData.physicsBody = body;
	}

	PhysicsTerrain.prototype = Object.create(THREE.Mesh.prototype);
	PhysicsTerrain.prototype.constructor = PhysicsTerrain;

	/**
	 * 生成高程数据（正弦曲线）
	 * @param {*} width 
	 * @param {*} depth 
	 * @param {*} minHeight 
	 * @param {*} maxHeight 
	 */
	PhysicsTerrain.prototype.generateHeight = function (width, depth, minHeight, maxHeight) {
	    var size = width * depth;
	    var data = new Float32Array(size);
	    var hRange = maxHeight - minHeight;
	    var w2 = width / 2;
	    var d2 = depth / 2;
	    var phaseMult = 12;
	    var p = 0;
	    for (var j = 0; j < depth; j++) {
	        for (var i = 0; i < width; i++) {
	            var radius = Math.sqrt(Math.pow((i - w2) / w2, 2.0) + Math.pow((j - d2) / d2, 2.0));
	            var height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight;
	            data[p] = height;
	            p++;
	        }
	    }
	    return data;
	};

	/**
	 * 创建物理地形形状
	 * @param {*} terrainWidth 
	 * @param {*} terrainDepth 
	 * @param {*} terrainWidthExtents 
	 * @param {*} terrainDepthExtents 
	 * @param {*} heightData 
	 * @param {*} terrainMinHeight 
	 * @param {*} terrainMaxHeight 
	 */
	PhysicsTerrain.prototype.createTerrainShape = function (terrainWidth, terrainDepth, terrainWidthExtents, terrainDepthExtents, heightData, terrainMinHeight, terrainMaxHeight) {
	    // 此参数并未真正使用，因为我们使用的是PHY_FLOAT高度数据类型，因此会被忽略。
	    var heightScale = 1;
	    // 向上轴 0表示X，1表示Y，2表示Z。通常使用1=Y。
	    var upAxis = 1;
	    // hdt，高度数据类型。 使用“PHY_FLOAT”。 可能的值为“PHY_FLOAT”，“PHY_UCHAR”，“PHY_SHORT”。
	    var hdt = "PHY_FLOAT";
	    // 根据您的需要设置（反转三角形）。
	    var flipQuadEdges = false;
	    // 在Ammo堆中创建高度数据缓冲区。
	    var ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);
	    // 将javascript高度数据数组复制到Ammo。
	    var p = 0;
	    var p2 = 0;
	    var dh = (terrainMinHeight + terrainMaxHeight) / 2;
	    for (var j = 0; j < terrainDepth; j++) {
	        for (var i = 0; i < terrainWidth; i++) {
	            // 将32位浮点数写入内存。
	            Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p] + dh;
	            p++;
	            // 4个字节/浮点数
	            p2 += 4;
	        }
	    }
	    // 创建高度场物理形状
	    var heightFieldShape = new Ammo.btHeightfieldTerrainShape(
	        terrainWidth,
	        terrainDepth,
	        ammoHeightData,
	        heightScale,
	        terrainMinHeight,
	        terrainMaxHeight,
	        upAxis,
	        hdt,
	        flipQuadEdges
	    );
	    // 设置水平缩放
	    var scaleX = terrainWidthExtents / (terrainWidth - 1);
	    var scaleZ = terrainDepthExtents / (terrainDepth - 1);
	    heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));
	    heightFieldShape.setMargin(0.05);
	    return heightFieldShape;
	};

	PhysicsTerrain.prototype.update = function (deltaTime, physicsWorld) {
	    physicsWorld.stepSimulation(deltaTime, 10);

	    var body = this.userData.physics.body;
	    var state = body.getMotionState();

	    if (state) {
	        var transformAux1 = new Ammo.btTransform();

	        state.getWorldTransform(transformAux1);
	        var p = transformAux1.getOrigin();
	        var q = transformAux1.getRotation();
	        this.position.set(p.x(), p.y(), p.z());
	        this.quaternion.set(q.x(), q.y(), q.z(), q.w());
	    }
	};

	/**
	 * 地形菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TerrainMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	TerrainMenu.prototype = Object.create(UI$1.Control.prototype);
	TerrainMenu.prototype.constructor = TerrainMenu;

	TerrainMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '地形'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                cls: 'option',
	                html: '创建地形',
	                onClick: this.createTerrain.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '创建着色器地形',
	                onClick: this.createShaderTerrain.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '创建物理地形',
	                onClick: this.createPhysicsTerrain.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '升高地形',
	                onClick: this.raiseTerrain.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '降低地形',
	                onClick: this.reduceTerrain.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '批量种树',
	                onClick: this.plantTrees.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// ---------------------------- 创建地形 -----------------------------------

	TerrainMenu.prototype.createTerrain = function () {
	    this.app.editor.execute(new AddObjectCommand(new Terrain()));
	};

	// ---------------------------- 创建着色器地形 ----------------------------------------

	TerrainMenu.prototype.createShaderTerrain = function () {
	    var dom = this.app.viewport.container.dom;

	    var terrain = new ShaderTerrain(this.app.editor.renderer, dom.clientWidth, dom.clientHeight);

	    this.app.editor.execute(new AddObjectCommand(terrain));

	    terrain.update(0);

	    // this.app.on(`animate.Terrain2`, (clock, deltaTime) => {
	    //     terrain.update(deltaTime);
	    // });
	};

	// ----------------------------- 创建物理地形 ---------------------------------

	TerrainMenu.prototype.createPhysicsTerrain = function () {
	    var terrain = new PhysicsTerrain();

	    this.app.editor.execute(new AddObjectCommand(terrain));

	    this.app.physics.world.addRigidBody(terrain.userData.physicsBody);
	    this.app.physics.rigidBodies.push(terrain);

	    //     this.app.on(`animate.${this.id}`, (clock, deltaTime) => {
	    //         terrain.update(deltaTime, this.app.physics.world);
	    //     });
	};

	// ---------------------------- 升高地形 -----------------------------------

	TerrainMenu.prototype.raiseTerrain = function () {

	};

	// ---------------------------- 降低地形 ------------------------------------

	TerrainMenu.prototype.reduceTerrain = function () {

	};

	// ----------------------------- 批量种树 --------------------------------------

	TerrainMenu.prototype.plantTrees = function () {

	};

	/**
	 * 物体菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function PhysicsMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	PhysicsMenu.prototype = Object.create(UI$1.Control.prototype);
	PhysicsMenu.prototype.constructor = PhysicsMenu;

	PhysicsMenu.prototype.render = function () {
	    var _this = this;

	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '物理'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '添加平板',
	                cls: 'option',
	                onClick: function () {
	                    _this.app.call('mAddPhysicsPlane', _this);
	                }
	            }, {
	                xtype: 'div',
	                html: '添加墙',
	                cls: 'option',
	                onClick: function () {
	                    _this.app.call('mAddPhysicsWall', _this);
	                }
	            }, {
	                xtype: 'div',
	                html: '添加布料',
	                cls: 'option',
	                onClick: function () {
	                    _this.app.call('mAddPhysicsCloth', _this);
	                }
	            }, {
	                xtype: 'div',
	                id: 'mThrowBall',
	                html: '开启探测小球',
	                cls: 'option',
	                onClick: function (event) {
	                    event.stopPropagation();
	                    event.preventDefault();
	                    _this.app.call('mThrowBall', _this);
	                }
	            }]
	        }]
	    });

	    container.render();
	};

	/**
	 * Object3D.userData.physics表示的物理数据结构
	 */
	var PhysicsData = {
	    // 物理形状
	    // btBoxShape: 正方体
	    // btBvhTriangleMeshShape: 三角形
	    // btCapsuleShape: 胶囊
	    // btCapsuleShapeX: x轴胶囊
	    // btCapsuleShapeY: y轴胶囊
	    // btCapsuleShapeZ: z轴胶囊
	    // btCompoundShape: 复合形状
	    // btConeShape: 圆锥体
	    // btConeShapeX: x轴圆椎体
	    // btConeShapeZ: z轴圆椎体
	    // btConvexHullShape: 凸包
	    // btConvexTriangleMeshShape: 凸三角形
	    // btCylinderShape: 圆柱体
	    // btCylinderShapeX: x轴圆柱体
	    // btCylinderShapeZ: z轴圆柱体
	    // btHeightfieldTerrainShape: 灰阶高程地形
	    // btSphereShape: 球体
	    // btStaticPlaneShape: 静态平板
	    shape: 'btBoxShape',

	    // 质量
	    mass: 1,

	    // 惯性
	    inertia: {
	        x: 0,
	        y: 0,
	        z: 0,
	    }
	};

	/**
	 * 物理工具
	 */
	var PlysicsUtils = {
	    /**
	     * 为Object3D对象添加刚体数据结构
	     */
	    addRigidBodyData: function (obj) {
	        if (!(obj instanceof THREE.Mesh)) {
	            UI$1.msg('暂时只能为THREE.Mesh添加刚体组件。');
	            return false;
	        }
	        if (obj.geometry instanceof THREE.PlaneBufferGeometry) {
	            obj.userData.physics = Object.assign({}, PhysicsData, {
	                shape: 'btStaticPlaneShape',
	                mass: 0
	            });
	        } else if (obj.geometry instanceof THREE.BoxBufferGeometry) {
	            obj.userData.physics = Object.assign({}, PhysicsData, {
	                shape: 'btBoxShape',
	            });
	        } else if (obj.geometry instanceof THREE.SphereBufferGeometry) {
	            obj.userData.physics = Object.assign({}, PhysicsData, {
	                shape: 'btSphereShape',
	            });
	        } else {
	            UI$1.msg(`暂不支持为${obj.geometry.constructor.name}几何体添加刚体组件。`);
	            return false;
	        }
	    },

	    /**
	     * 为Object3D对象添加刚体组件
	     */
	    createRigidBody: function (obj, margin) {
	        margin = margin || 0.05;

	        var position = obj.position;
	        var quaternion = obj.quaternion;
	        var scale = obj.scale;

	        var mass = obj.userData.physics.mass;
	        var inertia = obj.userData.physics.inertia;

	        var transform = new Ammo.btTransform();
	        transform.setIdentity();
	        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
	        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
	        var motionState = new Ammo.btDefaultMotionState(transform);

	        var shape = null;
	        if (obj.geometry instanceof THREE.PlaneBufferGeometry) {
	            var x = obj.geometry.parameters.width * scale.x;
	            var y = obj.geometry.parameters.height * scale.y;
	            shape = new Ammo.btBoxShape(new Ammo.btVector3(x * 0.5, y * 0.5, 0));
	        } else if (obj.geometry instanceof THREE.BoxBufferGeometry) {
	            var x = obj.geometry.parameters.width * scale.x;
	            var y = obj.geometry.parameters.height * scale.y;
	            var z = obj.geometry.parameters.depth * scale.z;
	            shape = new Ammo.btBoxShape(new Ammo.btVector3(x * 0.5, y * 0.5, z * 0.5));
	        } else if (obj.geometry instanceof THREE.SphereBufferGeometry) {
	            var radius = obj.geometry.parameters.radius;
	            shape = new Ammo.btSphereShape(radius);
	        } else {
	            console.warn(`PlysicsUtils: 无法为${obj.name}创建刚体组件。`);
	            return null;
	        }

	        shape.setMargin(margin);
	        var localInertia = new Ammo.btVector3(inertia.x, inertia.y, inertia.z);
	        shape.calculateLocalInertia(mass, localInertia);

	        var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	        return new Ammo.btRigidBody(info);
	    }
	};

	/**
	 * 组件菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ComponentMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	ComponentMenu.prototype = Object.create(UI$1.Control.prototype);
	ComponentMenu.prototype.constructor = ComponentMenu;

	ComponentMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '组件'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                html: '背景音乐',
	                cls: 'option',
	                onClick: this.onAddBackgroundMusic.bind(this)
	            }, {
	                xtype: 'div',
	                html: '粒子发射器',
	                cls: 'option',
	                onClick: this.ParticleEmitter.bind(this)
	            }, {
	                xtype: 'div',
	                html: '天空',
	                cls: 'option',
	                onClick: this.onAddSky.bind(this)
	            }, {
	                xtype: 'div',
	                html: '火焰',
	                cls: 'option',
	                onClick: this.onAddFire.bind(this)
	            }, {
	                xtype: 'div',
	                html: '烟',
	                cls: 'option',
	                onClick: this.onAddSmoke.bind(this)
	            }, {
	                xtype: 'hr'
	            }, {
	                xtype: 'div',
	                html: '刚体',
	                cls: 'option',
	                onClick: this.addRigidBody.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// ---------------------------- 添加背景音乐 ----------------------------------

	ComponentMenu.prototype.onAddBackgroundMusic = function () {
	    var editor = this.app.editor;
	    var listener = editor.audioListener;

	    var audio = new THREE.Audio(listener);
	    audio.name = `背景音乐`;
	    audio.autoplay = false;
	    audio.setLoop(true);
	    audio.setVolume(1.0);

	    audio.userData.autoplay = true;

	    this.app.editor.execute(new AddObjectCommand(audio));
	};

	// ---------------------------- 添加粒子发射器 --------------------------------------------

	ComponentMenu.prototype.ParticleEmitter = function () {
	    var emitter = new ParticleEmitter();
	    this.app.editor.execute(new AddObjectCommand(emitter));
	    emitter.userData.group.tick(0);
	};

	// ---------------------------- 天空 ----------------------------------------

	ComponentMenu.prototype.onAddSky = function () {
	    var obj = new Sky();
	    obj.name = '天空';
	    obj.userData.type = 'Sky';
	    this.app.editor.execute(new AddObjectCommand(obj));
	};

	// ---------------------------- 添加火焰 -------------------------------------

	ComponentMenu.prototype.onAddFire = function () {
	    var editor = this.app.editor;

	    var fire = new Fire(editor.camera);

	    editor.execute(new AddObjectCommand(fire));

	    fire.userData.fire.update(0);
	};

	// ------------------------------ 添加烟 ------------------------------------

	ComponentMenu.prototype.onAddSmoke = function () {
	    var editor = this.app.editor;
	    var camera = editor.camera;
	    var renderer = editor.renderer;

	    var smoke = new Smoke(camera, renderer);

	    smoke.position.y = 3;

	    editor.execute(new AddObjectCommand(smoke));

	    smoke.update(0);
	};

	// --------------------------- 添加刚体 ------------------------------------

	ComponentMenu.prototype.addRigidBody = function () {
	    var selected = this.app.editor.selected;
	    if (!selected) {
	        UI$1.msg('请选择几何体！');
	        return;
	    }

	    if (PlysicsUtils.addRigidBodyData(selected) !== false) {
	        this.app.call('objectChanged', this, selected);
	        UI$1.msg('添加刚体组件成功！');
	    }
	};

	/**
	 * 启动菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function PlayMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	    this.isPlaying = false;
	}

	PlayMenu.prototype = Object.create(UI$1.Control.prototype);
	PlayMenu.prototype.constructor = PlayMenu;

	PlayMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            id: 'mPlay',
	            xtype: 'div',
	            cls: 'title',
	            html: '启动',
	            onClick: this.onTogglePlay.bind(this)
	        }]
	    });

	    container.render();
	};

	PlayMenu.prototype.onTogglePlay = function () {
	    var editor = this.app.editor;

	    if (this.isPlaying === false) {
	        this.isPlaying = true;
	        UI$1.get('mPlay').dom.innerHTML = '停止';
	        this.startPlayer();
	    } else {
	        this.isPlaying = false;
	        UI$1.get('mPlay').dom.innerHTML = '启动';
	        this.stopPlayer();
	    }
	};

	PlayMenu.prototype.startPlayer = function () { // 启动播放器
	    this.app.player.start();
	};

	PlayMenu.prototype.stopPlayer = function () { // 停止播放器
	    this.app.player.stop();
	};

	/**
	 * 选项窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function OptionsWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	OptionsWindow.prototype = Object.create(UI$1.Control.prototype);
	OptionsWindow.prototype.constructor = OptionsWindow;

	OptionsWindow.prototype.render = function () {
	    var app = this.app;
	    var editor = app.editor;
	    var scene = editor.scene;
	    var renderer = editor.renderer;
	    var shadowMap = renderer.shadowMap;

	    this.window = UI$1.create({
	        xtype: 'window',
	        parent: this.app.container,
	        title: '选项窗口',
	        width: '500px',
	        height: '300px',
	        bodyStyle: {
	            padding: 0
	        },
	        shade: false,
	        children: [{
	            xtype: 'div',
	            cls: 'tabs',
	            children: [{
	                xtype: 'text',
	                id: 'surfaceTab',
	                scope: this.id,
	                text: '外观',
	                cls: 'selected',
	                onClick: () => {
	                    this.changeTab('外观');
	                }
	            }, {
	                xtype: 'text',
	                id: 'sceneTab',
	                scope: this.id,
	                text: '场景',
	                onClick: () => {
	                    this.changeTab('场景');
	                }
	            }, {
	                xtype: 'text',
	                id: 'rendererTab',
	                scope: this.id,
	                text: '渲染器',
	                onClick: () => {
	                    this.changeTab('渲染器');
	                }
	            }]
	        }, { // 外观选项卡
	            xtype: 'div',
	            id: 'surfacePanel',
	            scope: this.id,
	            cls: 'TabPanel',
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '主题'
	                }, {
	                    xtype: 'select',
	                    id: 'theme',
	                    options: {
	                        'assets/css/light.css': '浅色',
	                        'assets/css/dark.css': '深色'
	                    },
	                    value: app.options.theme,
	                    style: {
	                        width: '150px'
	                    }
	                }]
	            }]
	        }, { // 场景选项卡
	            xtype: 'div',
	            id: 'scenePanel',
	            scope: this.id,
	            cls: 'TabPanel',
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '背景'
	                }, {
	                    xtype: 'color',
	                    id: 'backgroundColor',
	                    scope: this.id,
	                    value: `#${scene.background.getHexString()}`
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '雾'
	                }, {
	                    xtype: 'select',
	                    id: 'fogType',
	                    scope: this.id,
	                    options: {
	                        'None': '无',
	                        'Fog': '线性',
	                        'FogExp2': '指数型'
	                    },
	                    value: scene.fog == null ? 'None' : ((scene.fog instanceof THREE.FogExp2) ? 'FogExp2' : 'Fog'),
	                    onChange: this.onChangeFogType.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                id: 'fogColorRow',
	                scope: this.id,
	                children: [{
	                    xtype: 'label',
	                    text: '雾颜色'
	                }, {
	                    xtype: 'color',
	                    id: 'fogColor',
	                    scope: this.id,
	                    value: `#${scene.fog == null ? 'aaaaaa' : scene.fog.color.getHexString()}`
	                }],
	                style: {
	                    display: scene.fog == null ? 'none' : ''
	                }
	            }, {
	                xtype: 'row',
	                id: 'fogNearRow',
	                scope: this.id,
	                children: [{
	                    xtype: 'label',
	                    text: '雾近点'
	                }, {
	                    xtype: 'number',
	                    id: 'fogNear',
	                    scope: this.id,
	                    value: (scene.fog && scene.fog instanceof THREE.Fog) ? scene.fog.near : 0.1,
	                    range: [0, Infinity]
	                }],
	                style: {
	                    display: (scene.fog && scene.fog instanceof THREE.Fog) ? '' : 'none'
	                }
	            }, {
	                xtype: 'row',
	                id: 'fogFarRow',
	                scope: this.id,
	                children: [{
	                    xtype: 'label',
	                    text: '雾远点'
	                }, {
	                    xtype: 'number',
	                    id: 'fogFar',
	                    scope: this.id,
	                    value: (scene.fog && scene.fog instanceof THREE.Fog) ? scene.fog.far : 50,
	                    range: [0, Infinity]
	                }],
	                style: {
	                    display: (scene.fog && scene.fog instanceof THREE.Fog) ? '' : 'none'
	                }
	            }, {
	                xtype: 'row',
	                id: 'fogDensityRow',
	                scope: this.id,
	                children: [{
	                    xtype: 'label',
	                    text: '雾浓度'
	                }, {
	                    xtype: 'number',
	                    id: 'fogDensity',
	                    scope: this.id,
	                    value: (scene.fog && scene.fog instanceof THREE.FogExp2) ? fog.density : 0.05,
	                    range: [0, 0.1],
	                    precision: 3
	                }],
	                style: {
	                    display: (scene.fog && scene.fog instanceof THREE.FogExp2) ? '' : 'none'
	                }
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '网格'
	                }, {
	                    xtype: 'boolean',
	                    id: 'showGrid',
	                    scope: this.id,
	                    value: this.app.editor.grid.visible
	                }]
	            }]
	        }, { // 渲染器选项卡
	            xtype: 'div',
	            id: 'rendererPanel',
	            scope: this.id,
	            cls: 'TabPanel',
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '阴影'
	                }, {
	                    xtype: 'select',
	                    id: 'shadowMapType',
	                    options: {
	                        [-1]: '禁用',
	                        [THREE.BasicShadowMap]: '基本阴影', // 0
	                        [THREE.PCFShadowMap]: 'PCF阴影', // 1
	                        [THREE.PCFSoftShadowMap]: 'PCF软阴影' // 2
	                    },
	                    value: shadowMap.enabled === false ? -1 : shadowMap.type
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: 'γ输入'
	                }, {
	                    xtype: 'boolean',
	                    id: 'gammaInput',
	                    value: renderer.gammaInput
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: 'γ输出'
	                }, {
	                    xtype: 'boolean',
	                    id: 'gammaOutput',
	                    value: renderer.gammaOutput
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: 'γ因子'
	                }, {
	                    xtype: 'number',
	                    id: 'gammaFactor',
	                    value: renderer.gammaFactor
	                }]
	            }]
	        }],
	        buttons: [{
	            xtype: 'button',
	            text: '保存',
	            onClick: () => {
	                this.save();
	            }
	        }, {
	            xtype: 'button',
	            text: '取消',
	            onClick: () => {
	                this.hide();
	            }
	        }]
	    });
	    this.window.render();
	};

	OptionsWindow.prototype.show = function () {
	    this.window.show();
	};

	OptionsWindow.prototype.hide = function () {
	    this.window.hide();
	};

	OptionsWindow.prototype.changeTab = function (name) {
	    if (name === '外观') {
	        UI$1.get('surfaceTab', this.id).dom.classList.add('selected');
	        UI$1.get('sceneTab', this.id).dom.classList.remove('selected');
	        UI$1.get('rendererTab', this.id).dom.classList.remove('selected');
	        UI$1.get('surfacePanel', this.id).dom.style.display = '';
	        UI$1.get('scenePanel', this.id).dom.style.display = 'none';
	        UI$1.get('rendererPanel', this.id).dom.style.display = 'none';
	    } else if (name === '场景') {
	        UI$1.get('surfaceTab', this.id).dom.classList.remove('selected');
	        UI$1.get('sceneTab', this.id).dom.classList.add('selected');
	        UI$1.get('rendererTab', this.id).dom.classList.remove('selected');
	        UI$1.get('surfacePanel', this.id).dom.style.display = 'none';
	        UI$1.get('scenePanel', this.id).dom.style.display = '';
	        UI$1.get('rendererPanel', this.id).dom.style.display = 'none';
	    } else if (name === '渲染器') {
	        UI$1.get('surfaceTab', this.id).dom.classList.remove('selected');
	        UI$1.get('sceneTab', this.id).dom.classList.remove('selected');
	        UI$1.get('rendererTab', this.id).dom.classList.add('selected');
	        UI$1.get('surfacePanel', this.id).dom.style.display = 'none';
	        UI$1.get('scenePanel', this.id).dom.style.display = 'none';
	        UI$1.get('rendererPanel', this.id).dom.style.display = '';
	    }
	};

	OptionsWindow.prototype.onChangeFogType = function () {
	    var fogType = UI$1.get('fogType', this.id).getValue();
	    var fogColorRow = UI$1.get('fogColorRow', this.id).dom;
	    var fogNearRow = UI$1.get('fogNearRow', this.id).dom;
	    var fogFarRow = UI$1.get('fogFarRow', this.id).dom;
	    var fogDensityRow = UI$1.get('fogDensityRow', this.id).dom;

	    switch (fogType) {
	        case 'None':
	            fogColorRow.style.display = 'none';
	            fogNearRow.style.display = 'none';
	            fogFarRow.style.display = 'none';
	            fogDensityRow.style.display = 'none';
	            break;
	        case 'Fog':
	            fogColorRow.style.display = '';
	            fogNearRow.style.display = '';
	            fogFarRow.style.display = '';
	            fogDensityRow.style.display = 'none';
	            break;
	        case 'FogExp2':
	            fogColorRow.style.display = '';
	            fogNearRow.style.display = 'none';
	            fogFarRow.style.display = 'none';
	            fogDensityRow.style.display = '';
	            break;
	    }
	};

	OptionsWindow.prototype.save = function () {
	    // 主题
	    var theme = UI$1.get('theme').getValue();
	    this.app.options.theme = theme;
	    document.getElementById('theme').href = theme;

	    // 场景
	    var scene = this.app.editor.scene;

	    var backgroundColor = UI$1.get('backgroundColor', this.id).getHexValue();
	    scene.background = new THREE.Color(backgroundColor);

	    var fogType = UI$1.get('fogType', this.id).getValue();
	    var fogColor = UI$1.get('fogColor', this.id).getHexValue();
	    var fogNear = UI$1.get('fogNear', this.id).getValue();
	    var fogFar = UI$1.get('fogFar', this.id).getValue();
	    var fogDensity = UI$1.get('fogDensity', this.id).getValue();

	    switch (fogType) {
	        case 'None':
	            scene.fog = null;
	            break;
	        case 'Fog':
	            scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
	            break;
	        case 'FogExp2':
	            scene.fog = new THREE.FogExp2(fogColor, fogDensity);
	            break;
	    }

	    var showGrid = UI$1.get('showGrid', this.id).getValue();
	    this.app.editor.grid.visible = showGrid;

	    // 渲染器
	    var shadowMapType = parseInt(UI$1.get('shadowMapType').getValue());
	    var gammaInput = UI$1.get('gammaInput').getValue();
	    var gammaOutput = UI$1.get('gammaOutput').getValue();
	    var gammaFactor = UI$1.get('gammaFactor').getValue();

	    var renderer = this.app.editor.renderer;
	    var json = (new WebGLRendererSerializer(this.app)).toJSON(renderer);
	    var newRenderer = (new WebGLRendererSerializer(this.app)).fromJSON(json);

	    if (shadowMapType === -1) {
	        newRenderer.shadowMap.enabled = false;
	    } else {
	        newRenderer.shadowMap.enabled = true;
	        newRenderer.shadowMap.type = shadowMapType;
	    }
	    newRenderer.gammaInput = gammaInput;
	    newRenderer.gammaOutput = gammaOutput;
	    newRenderer.gammaFactor = gammaFactor;

	    this.app.viewport.container.dom.removeChild(renderer.domElement);
	    this.app.viewport.container.dom.appendChild(newRenderer.domElement);
	    this.app.editor.renderer = newRenderer;
	    this.app.editor.renderer.setSize(this.app.viewport.container.dom.offsetWidth, this.app.viewport.container.dom.offsetHeight);
	    this.app.call('render', this);

	    // 隐藏窗口
	    this.hide();
	    UI$1.msg('保存成功。');
	};

	/**
	 * 选项菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function OptionsMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	OptionsMenu.prototype = Object.create(UI$1.Control.prototype);
	OptionsMenu.prototype.constructor = OptionsMenu;

	OptionsMenu.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '选项'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                cls: 'option',
	                html: '外观',
	                onClick: this.onSurfaceOptions.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '场景',
	                onClick: this.onSceneOptions.bind(this)
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '渲染器',
	                onClick: this.onRendererOptions.bind(this)
	            }]
	        }]
	    });

	    container.render();
	};

	// ---------------------------------- 外观选项 ---------------------------------------

	OptionsMenu.prototype.onSurfaceOptions = function () {
	    if (this.optionsWindow === undefined) {
	        this.optionsWindow = new OptionsWindow({ app: this.app });
	        this.optionsWindow.render();
	    }
	    this.optionsWindow.show();
	    this.optionsWindow.changeTab('外观');
	};

	// ---------------------------------- 场景选项 ---------------------------------------

	OptionsMenu.prototype.onSceneOptions = function () {
	    if (this.optionsWindow === undefined) {
	        this.optionsWindow = new OptionsWindow({ app: this.app });
	        this.optionsWindow.render();
	    }
	    this.optionsWindow.show();
	    this.optionsWindow.changeTab('场景');
	};

	// ---------------------------------- 渲染器选项 -------------------------------------

	OptionsMenu.prototype.onRendererOptions = function () {
	    if (this.optionsWindow === undefined) {
	        this.optionsWindow = new OptionsWindow({ app: this.app });
	        this.optionsWindow.render();
	    }
	    this.optionsWindow.show();
	    this.optionsWindow.changeTab('渲染器');
	};

	/**
	 * 帮助菜单
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function HelpMenu(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	HelpMenu.prototype = Object.create(UI$1.Control.prototype);
	HelpMenu.prototype.constructor = HelpMenu;

	HelpMenu.prototype.render = function () {

	    var container = UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'menu',
	        children: [{
	            xtype: 'div',
	            cls: 'title',
	            html: '帮助'
	        }, {
	            xtype: 'div',
	            cls: 'options',
	            children: [{
	                xtype: 'div',
	                cls: 'option',
	                html: '源码',
	                onClick: () => {
	                    window.open('https://github.com/tengge1/ShadowEditor', '_blank');
	                }
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '示例',
	                onClick: () => {
	                    window.open('https://github.com/tengge1/ShadowEditor-examples', '_blank');
	                }
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '文档',
	                onClick: () => {
	                    window.open('https://tengge1.github.io/ShadowEditor/', '_blank');
	                }
	            }, {
	                xtype: 'div',
	                cls: 'option',
	                html: '关于',
	                onClick: () => {
	                    UI$1.alert(
	                        `About`,
	                        `Name: ShadowEditor<br />
                        Author: tengge<br />
                        License: MIT<br />
                        Thanks to three.js and everyone who helped us.`
	                    );
	                }
	            }]
	        }]
	    });

	    container.render();
	};

	/**
	 * 状态菜单（菜单栏右侧）
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function StatusMenu(options) {
	    UI$1.Control.call(this, options);
	    options = options || {};

	    this.app = options.app;
	}

	StatusMenu.prototype = Object.create(UI$1.Control.prototype);
	StatusMenu.prototype.constructor = StatusMenu;

	StatusMenu.prototype.render = function () {

	    var container = UI$1.create({
	        xtype: 'div',
	        id: 'mStatus',
	        parent: this.parent,
	        cls: 'menu right',
	        children: [{
	            xtype: 'text',
	            text: 'r' + THREE.REVISION,
	            cls: 'title version'
	        }]
	    });

	    container.render();
	};

	/**
	 * 菜单栏
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Menubar(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	Menubar.prototype = Object.create(UI$1.Control.prototype);
	Menubar.prototype.constructor = Menubar;

	Menubar.prototype.render = function () {
	    var params = { app: this.app };

	    var container = UI$1.create({
	        xtype: 'div',
	        id: 'menubar',
	        cls: 'menubar',
	        parent: this.parent,
	        children: [
	            // Logo
	            new Logo(params),

	            // 左侧
	            new SceneMenu(params),
	            new EditMenu(params),
	            new GeometryMenu(params),
	            new LightMenu(params),
	            new AssetMenu(params),
	            new TerrainMenu(params),
	            new PhysicsMenu(params),
	            new ComponentMenu(params),
	            new PlayMenu(params),
	            new OptionsMenu(params),
	            new HelpMenu(params),

	            // 右侧
	            new StatusMenu(params)
	        ]
	    });

	    container.render();
	};

	/**
	 * 工具栏
	 * @author tengge / https://github.com/tengge1
	 */
	function Toolbar(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	Toolbar.prototype = Object.create(UI$1.Control.prototype);
	Toolbar.prototype.constructor = Toolbar;

	Toolbar.prototype.render = function () {

	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'toolbar',
	        children: [{
	            xtype: 'iconbutton',
	            id: 'selectBtn',
	            scope: this.id,
	            icon: 'icon-select',
	            title: '选择',
	            onClick: this.enterSelectMode.bind(this)
	        }, {
	            xtype: 'iconbutton',
	            id: 'translateBtn',
	            scope: this.id,
	            icon: 'icon-translate',
	            cls: 'Button IconButton selected',
	            title: '平移(W)',
	            onClick: this.enterTranslateMode.bind(this)
	        }, {
	            xtype: 'iconbutton',
	            id: 'rotateBtn',
	            scope: this.id,
	            icon: 'icon-rotate',
	            title: '旋转(E)',
	            onClick: this.enterRotateMode.bind(this)
	        }, {
	            xtype: 'iconbutton',
	            id: 'scaleBtn',
	            scope: this.id,
	            icon: 'icon-scale',
	            title: '缩放(R)',
	            onClick: this.enterScaleMode.bind(this)
	        }, {
	            xtype: 'hr'
	        }, {
	            xtype: 'iconbutton',
	            icon: 'icon-model-view',
	            title: '模型',
	            onClick: this.showModelWindow.bind(this)
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`changeMode.${this.id}`, this.onChangeMode.bind(this));
	};

	// --------------------------------- 选择模式 -------------------------------------

	Toolbar.prototype.enterSelectMode = function () {
	    this.app.call('changeMode', this, 'select');
	};

	// -------------------------------- 平移模式 --------------------------------------

	Toolbar.prototype.enterTranslateMode = function () {
	    this.app.call('changeMode', this, 'translate');
	};

	// -------------------------------- 旋转模式 ---------------------------------------

	Toolbar.prototype.enterRotateMode = function () {
	    this.app.call('changeMode', this, 'rotate');
	};

	// -------------------------------- 缩放模式 ---------------------------------------

	Toolbar.prototype.enterScaleMode = function () {
	    this.app.call('changeMode', this, 'scale');
	};

	// ------------------------------ 模式改变事件 -------------------------------------

	Toolbar.prototype.onChangeMode = function (mode) {
	    var selectBtn = UI$1.get('selectBtn', this.id);
	    var translateBtn = UI$1.get('translateBtn', this.id);
	    var rotateBtn = UI$1.get('rotateBtn', this.id);
	    var scaleBtn = UI$1.get('scaleBtn', this.id);

	    selectBtn.unselect();
	    translateBtn.unselect();
	    rotateBtn.unselect();
	    scaleBtn.unselect();

	    switch (mode) {
	        case 'select':
	            selectBtn.select();
	            break;
	        case 'translate':
	            translateBtn.select();
	            break;
	        case 'rotate':
	            rotateBtn.select();
	            break;
	        case 'scale':
	            scaleBtn.select();
	            break;
	    }
	};

	// -------------------------------- 模型窗口 ---------------------------------------

	Toolbar.prototype.showModelWindow = function () {
	    if (this.modelWindow == null) {
	        this.modelWindow = new ModelWindow({
	            parent: this.app.container,
	            app: this.app
	        });
	        this.modelWindow.render();
	    }
	    this.modelWindow.show();
	};

	/**
	 * 场景编辑区
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Viewport(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	Viewport.prototype = Object.create(UI$1.Control.prototype);
	Viewport.prototype.constructor = Viewport;

	Viewport.prototype.render = function () {
	    this.container = UI$1.create({
	        xtype: 'div',
	        id: 'viewport',
	        parent: this.parent,
	        cls: 'viewport'
	    });
	    this.container.render();
	};

	/**
	 * 所有组件基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function BaseComponent(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	BaseComponent.prototype = Object.create(UI$1.Control.prototype);
	BaseComponent.prototype.constructor = BaseComponent;

	BaseComponent.prototype.render = function () {

	};

	/**
	 * 设置值命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue number, string, boolean or object
	 * @constructor
	 */
	function SetValueCommand(object, attributeName, newValue) {
		Command.call(this);

		this.type = 'SetValueCommand';
		this.name = '设置' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = (object !== undefined) ? object[attributeName] : undefined;
		this.newValue = newValue;
	}
	SetValueCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetValueCommand.prototype, {
		constructor: SetValueCommand,

		execute: function () {
			this.object[this.attributeName] = this.newValue;
			this.editor.app.call('objectChanged', this, this.object);
		},

		undo: function () {
			this.object[this.attributeName] = this.oldValue;
			this.editor.app.call('objectChanged', this, this.object);
		},

		update: function (cmd) {
			this.newValue = cmd.newValue;
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.object = this.editor.objectByUuid(json.objectUuid);
		}
	});

	/**
	 * 基本信息组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function BasicComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	BasicComponent.prototype = Object.create(BaseComponent.prototype);
	BasicComponent.prototype.constructor = BasicComponent;

	BasicComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'basicPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            borderTop: 0,
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '基本信息'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id,
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.onChangeName.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'text',
	                id: 'type',
	                scope: this.id
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '可见性'
	            }, {
	                xtype: 'checkbox',
	                id: 'visible',
	                scope: this.id,
	                onChange: this.onChangeVisible.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	BasicComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	BasicComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	BasicComponent.prototype.updateUI = function () {
	    var container = UI.get('basicPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var name = UI.get('name', this.id);
	    var type = UI.get('type', this.id);
	    var visible = UI.get('visible', this.id);

	    name.setValue(this.selected.name);
	    type.setValue(this.selected.constructor.name);
	    visible.setValue(this.selected.visible);
	};

	BasicComponent.prototype.onChangeName = function () {
	    var name = UI.get('name', this.id);
	    var editor = this.app.editor;

	    editor.execute(new SetValueCommand(this.selected, 'name', name.getValue()));
	};

	BasicComponent.prototype.onChangeVisible = function () {
	    this.selected.visible = UI.get('visible', this.id).getValue();
	};

	/**
	 * 位移组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TransformComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	TransformComponent.prototype = Object.create(BaseComponent.prototype);
	TransformComponent.prototype.constructor = TransformComponent;

	TransformComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'transformPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    style: {
	                        color: '#555',
	                        fontWeight: 'bold'
	                    },
	                    text: '位移组件'
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '平移'
	                }, {
	                    xtype: 'number',
	                    id: 'objectPositionX',
	                    scope: this.id,
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangePosition.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectPositionY',
	                    scope: this.id,
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangePosition.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectPositionZ',
	                    scope: this.id,
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangePosition.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '旋转'
	                }, {
	                    xtype: 'number',
	                    id: 'objectRotationX',
	                    scope: this.id,
	                    step: 10,
	                    unit: '°',
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeRotation.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectRotationY',
	                    scope: this.id,
	                    step: 10,
	                    unit: '°',
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeRotation.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectRotationZ',
	                    scope: this.id,
	                    step: 10,
	                    unit: '°',
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeRotation.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '缩放'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'objectScaleLock',
	                    scope: this.id,
	                    value: true,
	                    style: {
	                        position: 'absolute',
	                        left: '50px'
	                    }
	                }, {
	                    xtype: 'number',
	                    id: 'objectScaleX',
	                    scope: this.id,
	                    value: 1,
	                    range: [0.01, Infinity],
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeScale.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectScaleY',
	                    scope: this.id,
	                    value: 1,
	                    range: [0.01, Infinity],
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeScale.bind(this)
	                }, {
	                    xtype: 'number',
	                    id: 'objectScaleZ',
	                    scope: this.id,
	                    value: 1,
	                    range: [0.01, Infinity],
	                    style: {
	                        width: '40px'
	                    },
	                    onChange: this.onChangeScale.bind(this)
	                }]
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	TransformComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	TransformComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	TransformComponent.prototype.updateUI = function () {
	    var container = UI.get('transformPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var objectPositionX = UI.get('objectPositionX', this.id);
	    var objectPositionY = UI.get('objectPositionY', this.id);
	    var objectPositionZ = UI.get('objectPositionZ', this.id);

	    var objectRotationX = UI.get('objectRotationX', this.id);
	    var objectRotationY = UI.get('objectRotationY', this.id);
	    var objectRotationZ = UI.get('objectRotationZ', this.id);

	    var objectScaleX = UI.get('objectScaleX', this.id);
	    var objectScaleY = UI.get('objectScaleY', this.id);
	    var objectScaleZ = UI.get('objectScaleZ', this.id);

	    objectPositionX.setValue(this.selected.position.x);
	    objectPositionY.setValue(this.selected.position.y);
	    objectPositionZ.setValue(this.selected.position.z);

	    objectRotationX.setValue(this.selected.rotation.x * 180 / Math.PI);
	    objectRotationY.setValue(this.selected.rotation.y * 180 / Math.PI);
	    objectRotationZ.setValue(this.selected.rotation.z * 180 / Math.PI);

	    objectScaleX.setValue(this.selected.scale.x);
	    objectScaleY.setValue(this.selected.scale.y);
	    objectScaleZ.setValue(this.selected.scale.z);
	};

	TransformComponent.prototype.onChangePosition = function () {
	    var x = UI.get('objectPositionX', this.id).getValue();
	    var y = UI.get('objectPositionY', this.id).getValue();
	    var z = UI.get('objectPositionZ', this.id).getValue();

	    this.app.editor.execute(new SetPositionCommand(this.selected, new THREE.Vector3(x, y, z)));
	};

	TransformComponent.prototype.onChangeRotation = function () {
	    var x = UI.get('objectRotationX', this.id).getValue();
	    var y = UI.get('objectRotationY', this.id).getValue();
	    var z = UI.get('objectRotationZ', this.id).getValue();

	    this.app.editor.execute(new SetRotationCommand(this.selected, new THREE.Euler(x * Math.PI / 180, y * Math.PI / 180, z * Math.PI / 180)));
	};

	TransformComponent.prototype.onChangeScale = function (value) {
	    var x = UI.get('objectScaleX', this.id).getValue();
	    var y = UI.get('objectScaleY', this.id).getValue();
	    var z = UI.get('objectScaleZ', this.id).getValue();
	    var locked = UI.get('objectScaleLock', this.id).getValue();

	    if (locked) {
	        this.app.editor.execute(new SetScaleCommand(this.selected, new THREE.Vector3(value, value, value)));
	    } else {
	        this.app.editor.execute(new SetScaleCommand(this.selected, new THREE.Vector3(x, y, z)));
	    }
	};

	/**
	 * 相机组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function CameraComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	CameraComponent.prototype = Object.create(BaseComponent.prototype);
	CameraComponent.prototype.constructor = CameraComponent;

	CameraComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'cameraPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '相机组件'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '视场'
	            }, {
	                xtype: 'number',
	                id: 'objectFov',
	                scope: this.id,
	                onChange: this.onSetObjectFov.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '近点'
	            }, {
	                xtype: 'number',
	                id: 'objectNear',
	                scope: this.id,
	                onChange: this.onSetObjectNear.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '远点'
	            }, {
	                xtype: 'number',
	                id: 'objectFar',
	                scope: this.id,
	                onChange: this.onSetObjectFar.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	CameraComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	CameraComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	CameraComponent.prototype.updateUI = function () {
	    var container = UI.get('cameraPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.PerspectiveCamera) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var objectFov = UI.get('objectFov', this.id);
	    var objectNear = UI.get('objectNear', this.id);
	    var objectFar = UI.get('objectFar', this.id);

	    objectFov.setValue(this.selected.fov);
	    objectNear.setValue(this.selected.near);
	    objectFar.setValue(this.selected.far);
	};

	CameraComponent.prototype.onSetObjectFov = function () {
	    var fov = UI.get('objectFov', this.id).getValue();
	    this.app.editor.execute(new SetValueCommand(this.selected, 'fov', fov));
	};

	CameraComponent.prototype.onSetObjectNear = function () {
	    var near = UI.get('objectNear', this.id).getValue();
	    this.app.editor.execute(new SetValueCommand(this.selected, 'near', near));
	};

	CameraComponent.prototype.onSetObjectFar = function () {
	    var far = UI.get('objectFar', this.id).getValue();
	    this.app.editor.execute(new SetValueCommand(this.selected, 'far', far));
	};

	/**
	 * 光源组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function LightComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	LightComponent.prototype = Object.create(BaseComponent.prototype);
	LightComponent.prototype.constructor = LightComponent;

	LightComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'lightPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '光源组件'
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectColorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '颜色'
	            }, {
	                xtype: 'color',
	                id: 'objectColor',
	                scope: this.id,
	                onChange: this.onChangeColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectIntensityRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '强度'
	            }, {
	                xtype: 'number',
	                id: 'objectIntensity',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChangeIntensity.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectDistanceRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '距离'
	            }, {
	                xtype: 'number',
	                id: 'objectDistance',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChangeDistance.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectAngleRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '角度'
	            }, {
	                xtype: 'number',
	                id: 'objectAngle',
	                scope: this.id,
	                precision: 3,
	                range: [0, Math.PI / 2],
	                onChange: this.onChangeAngle.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectPenumbraRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '半阴影'
	            }, {
	                xtype: 'number',
	                id: 'objectPenumbra',
	                scope: this.id,
	                range: [0, 1],
	                onChange: this.onChangePenumbra.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectDecayRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '衰减'
	            }, {
	                xtype: 'number',
	                id: 'objectDecay',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChangeDecay.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectSkyColorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '天空颜色'
	            }, {
	                xtype: 'color',
	                id: 'objectSkyColor',
	                scope: this.id,
	                onChange: this.onChangeSkyColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectGroundColorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '地面颜色'
	            }, {
	                xtype: 'color',
	                id: 'objectGroundColor',
	                scope: this.id,
	                onChange: this.onChangeGroundColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectWidthRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '宽度'
	            }, {
	                xtype: 'number',
	                id: 'objectWidth',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChangeWidth.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectHeightRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '高度'
	            }, {
	                xtype: 'number',
	                id: 'objectHeight',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChangeHeight.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	LightComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	LightComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	LightComponent.prototype.updateUI = function () {
	    var container = UI.get('lightPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Light) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var objectColorRow = UI.get('objectColorRow', this.id);
	    var objectIntensityRow = UI.get('objectIntensityRow', this.id);
	    var objectDistanceRow = UI.get('objectDistanceRow', this.id);
	    var objectAngleRow = UI.get('objectAngleRow', this.id);
	    var objectPenumbraRow = UI.get('objectPenumbraRow', this.id);
	    var objectDecayRow = UI.get('objectDecayRow', this.id);
	    var objectSkyColorRow = UI.get('objectSkyColorRow', this.id);
	    var objectGroundColorRow = UI.get('objectGroundColorRow', this.id);
	    var objectWidthRow = UI.get('objectWidthRow', this.id);
	    var objectHeightRow = UI.get('objectHeightRow', this.id);

	    var objectColor = UI.get('objectColor', this.id);
	    var objectIntensity = UI.get('objectIntensity', this.id);
	    var objectDistance = UI.get('objectDistance', this.id);
	    var objectAngle = UI.get('objectAngle', this.id);
	    var objectPenumbra = UI.get('objectPenumbra', this.id);
	    var objectDecay = UI.get('objectDecay', this.id);
	    var objectSkyColor = UI.get('objectSkyColor', this.id);
	    var objectGroundColor = UI.get('objectGroundColor', this.id);
	    var objectWidth = UI.get('objectWidth', this.id);
	    var objectHeight = UI.get('objectHeight', this.id);

	    if (this.selected instanceof THREE.HemisphereLight) {
	        objectColorRow.dom.style.display = 'none';
	    } else {
	        objectColorRow.dom.style.display = '';
	        objectColor.setValue(`#${this.selected.color.getHexString()}`);
	    }

	    objectIntensityRow.dom.style.display = '';
	    objectIntensity.setValue(this.selected.intensity);

	    if (this.selected instanceof THREE.PointLight || this.selected instanceof THREE.SpotLight) {
	        objectDistanceRow.dom.style.display = '';
	        objectDecayRow.dom.style.display = '';
	        objectDistance.setValue(this.selected.distance);
	        objectDecay.setValue(this.selected.decay);
	    } else {
	        objectDistanceRow.dom.style.display = 'none';
	        objectDecayRow.dom.style.display = 'none';
	    }

	    if (this.selected instanceof THREE.SpotLight) {
	        objectAngleRow.dom.style.display = '';
	        objectPenumbraRow.dom.style.display = '';
	        objectAngle.setValue(this.selected.angle);
	        objectPenumbra.setValue(this.selected.penumbra);
	    } else {
	        objectAngleRow.dom.style.display = 'none';
	        objectPenumbraRow.dom.style.display = 'none';
	    }

	    if (this.selected instanceof THREE.HemisphereLight) {
	        objectSkyColorRow.dom.style.display = '';
	        objectGroundColorRow.dom.style.display = '';
	        objectSkyColor.setValue(`#${this.selected.color.getHexString()}`);
	        objectGroundColor.setValue(`#${this.selected.groundColor.getHexString()}`);
	    } else {
	        objectSkyColorRow.dom.style.display = 'none';
	        objectGroundColorRow.dom.style.display = 'none';
	    }

	    if (this.selected instanceof THREE.RectAreaLight) {
	        objectWidthRow.dom.style.display = '';
	        objectHeightRow.dom.style.display = '';
	        objectWidth.setValue(this.selected.width);
	        objectHeight.setValue(this.selected.height);
	    } else {
	        objectWidthRow.dom.style.display = 'none';
	        objectHeightRow.dom.style.display = 'none';
	    }
	};

	LightComponent.prototype.onChangeColor = function () {
	    var objectColor = UI.get('objectColor', this.id);
	    this.selected.color = new THREE.Color(objectColor.getHexValue());
	    var helper = this.selected.children.filter(n => n.userData.type === 'helper')[0];
	    if (helper) {
	        helper.material.color = this.selected.color;
	    }
	};

	LightComponent.prototype.onChangeIntensity = function () {
	    var objectIntensity = UI.get('objectIntensity', this.id);
	    this.selected.intensity = objectIntensity.getValue();
	};

	LightComponent.prototype.onChangeDistance = function () {
	    var objectDistance = UI.get('objectDistance', this.id);
	    this.selected.distance = objectDistance.getValue();
	};

	LightComponent.prototype.onChangeAngle = function () {
	    var objectAngle = UI.get('objectAngle', this.id);
	    this.selected.angle = objectAngle.getValue();
	};

	LightComponent.prototype.onChangePenumbra = function () {
	    var objectPenumbra = UI.get('objectPenumbra', this.id);
	    this.selected.penumbra = objectPenumbra.getValue();
	};

	LightComponent.prototype.onChangeDecay = function () {
	    var objectDecay = UI.get('objectDecay', this.id);
	    this.selected.decay = objectDecay.getValue();
	};

	LightComponent.prototype.onChangeSkyColor = function () {
	    var objectSkyColor = UI.get('objectSkyColor', this.id);
	    this.selected.color = new THREE.Color(objectSkyColor.getHexValue());

	    var sky = this.selected.children.filter(n => n.userData.type === 'sky')[0];
	    if (sky) {
	        sky.material.uniforms.topColor.value = this.selected.color;
	    }
	};

	LightComponent.prototype.onChangeGroundColor = function () {
	    var objectGroundColor = UI.get('objectGroundColor', this.id);
	    this.selected.groundColor = new THREE.Color(objectGroundColor.getHexValue());

	    var sky = this.selected.children.filter(n => n.userData.type === 'sky')[0];
	    if (sky) {
	        sky.material.uniforms.bottomColor.value = this.selected.groundColor;
	    }
	};

	LightComponent.prototype.onChangeWidth = function () {
	    var objectWidth = UI.get('objectWidth', this.id);
	    this.selected.width = objectWidth.getValue();
	};

	LightComponent.prototype.onChangeHeight = function () {
	    var objectHeight = UI.get('objectHeight', this.id);
	    this.selected.height = objectHeight.getValue();
	};

	/**
	 * 阴影组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ShadowComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	ShadowComponent.prototype = Object.create(BaseComponent.prototype);
	ShadowComponent.prototype.constructor = ShadowComponent;

	ShadowComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'shadowPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '阴影组件'
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectShadowRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '阴影'
	            }, {
	                xtype: 'boolean',
	                id: 'objectCastShadow',
	                scope: this.id,
	                value: false,
	                text: '产生',
	                onChange: this.onChangeCastShadow.bind(this)
	            }, {
	                xtype: 'boolean',
	                id: 'objectReceiveShadow',
	                scope: this.id,
	                value: false,
	                text: '接收',
	                onChange: this.onChangeReceiveShadow.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectShadowRadiusRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'objectShadowRadius',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeShadowRadius.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectMapSizeRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '贴图尺寸'
	            }, {
	                xtype: 'select',
	                id: 'objectMapSize',
	                scope: this.id,
	                options: {
	                    512: '512*512',
	                    1024: '1024*1024',
	                    2048: '2048*2048'
	                },
	                value: 512,
	                onChange: this.onChangeMapSize.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectBiasRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '偏差'
	            }, {
	                xtype: 'number',
	                id: 'objectBias',
	                scope: this.id,
	                value: 0,
	                range: [0, 1],
	                onChange: this.onChangeBias.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraLeftRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机左'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraLeft',
	                scope: this.id,
	                value: -5,
	                onChange: this.onChangeCameraLeft.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraRightRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机右'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraRight',
	                scope: this.id,
	                value: 5,
	                onChange: this.onChangeCameraRight.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraTopRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机上'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraTop',
	                scope: this.id,
	                value: 5,
	                onChange: this.onChangeCameraTop.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraBottomRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机下'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraBottom',
	                scope: this.id,
	                value: -5,
	                onChange: this.onChangeCameraBottom.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraNearRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机近'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraNear',
	                scope: this.id,
	                value: 0.5,
	                range: [0, Infinity],
	                onChange: this.onChangeCameraNear.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'objectCameraFarRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '相机远'
	            }, {
	                xtype: 'number',
	                id: 'objectCameraFar',
	                scope: this.id,
	                value: 0.5,
	                range: [0, Infinity],
	                onChange: this.onChangeCameraFar.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	ShadowComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	ShadowComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	ShadowComponent.prototype.updateUI = function () {
	    var container = UI.get('shadowPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && (editor.selected instanceof THREE.Mesh || editor.selected instanceof THREE.DirectionalLight || editor.selected instanceof THREE.PointLight || editor.selected instanceof THREE.SpotLight)) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var objectShadowRadiusRow = UI.get('objectShadowRadiusRow', this.id);
	    var objectMapSizeRow = UI.get('objectMapSizeRow', this.id);
	    var objectBiasRow = UI.get('objectBiasRow', this.id);
	    var objectCameraLeftRow = UI.get('objectCameraLeftRow', this.id);
	    var objectCameraRightRow = UI.get('objectCameraRightRow', this.id);
	    var objectCameraTopRow = UI.get('objectCameraTopRow', this.id);
	    var objectCameraBottomRow = UI.get('objectCameraBottomRow', this.id);
	    var objectCameraNearRow = UI.get('objectCameraNearRow', this.id);
	    var objectCameraFarRow = UI.get('objectCameraFarRow', this.id);

	    var objectCastShadow = UI.get('objectCastShadow', this.id);
	    var objectReceiveShadow = UI.get('objectReceiveShadow', this.id);
	    var objectShadowRadius = UI.get('objectShadowRadius', this.id);
	    var objectMapSize = UI.get('objectMapSize', this.id);
	    var objectBias = UI.get('objectBias', this.id);
	    var objectCameraLeft = UI.get('objectCameraLeft', this.id);
	    var objectCameraRight = UI.get('objectCameraRight', this.id);
	    var objectCameraTop = UI.get('objectCameraTop', this.id);
	    var objectCameraBottom = UI.get('objectCameraBottom', this.id);
	    var objectCameraNear = UI.get('objectCameraNear', this.id);
	    var objectCameraFar = UI.get('objectCameraFar', this.id);

	    objectCastShadow.setValue(this.selected.castShadow);

	    if (this.selected instanceof THREE.Light) {
	        objectReceiveShadow.dom.style.display = 'none';
	        objectShadowRadiusRow.dom.style.display = '';
	        objectMapSizeRow.dom.style.display = '';
	        objectBiasRow.dom.style.display = '';
	        objectCameraLeftRow.dom.style.display = '';
	        objectCameraRightRow.dom.style.display = '';
	        objectCameraTopRow.dom.style.display = '';
	        objectCameraBottomRow.dom.style.display = '';
	        objectCameraNearRow.dom.style.display = '';
	        objectCameraFarRow.dom.style.display = '';

	        objectShadowRadius.setValue(this.selected.shadow.radius);
	        var mapSize = this.selected.shadow.mapSize;
	        objectMapSize.setValue(mapSize.x);
	        objectBias.setValue(this.selected.shadow.bias);
	        objectCameraLeft.setValue(this.selected.shadow.camera.left);
	        objectCameraRight.setValue(this.selected.shadow.camera.right);
	        objectCameraTop.setValue(this.selected.shadow.camera.top);
	        objectCameraBottom.setValue(this.selected.shadow.camera.bottom);
	        objectCameraNear.setValue(this.selected.shadow.camera.near);
	        objectCameraFar.setValue(this.selected.shadow.camera.far);
	    } else {
	        objectReceiveShadow.dom.style.display = '';
	        objectShadowRadiusRow.dom.style.display = 'none';
	        objectMapSizeRow.dom.style.display = 'none';
	        objectBiasRow.dom.style.display = 'none';
	        objectCameraLeftRow.dom.style.display = 'none';
	        objectCameraRightRow.dom.style.display = 'none';
	        objectCameraTopRow.dom.style.display = 'none';
	        objectCameraBottomRow.dom.style.display = 'none';
	        objectCameraNearRow.dom.style.display = 'none';
	        objectCameraFarRow.dom.style.display = 'none';

	        objectReceiveShadow.setValue(this.selected.receiveShadow);
	    }
	};

	ShadowComponent.prototype.onChangeCastShadow = function () {
	    var objectCastShadow = UI.get('objectCastShadow', this.id);
	    this.selected.castShadow = objectCastShadow.getValue();
	    if (this.selected instanceof THREE.Mesh) {
	        this.updateMaterial(this.selected.material);
	    }
	};

	ShadowComponent.prototype.onChangeReceiveShadow = function () {
	    var objectReceiveShadow = UI.get('objectReceiveShadow', this.id);
	    this.selected.receiveShadow = objectReceiveShadow.getValue();
	    if (this.selected instanceof THREE.Mesh) {
	        this.updateMaterial(this.selected.material);
	    }
	};

	ShadowComponent.prototype.onChangeShadowRadius = function () {
	    var objectShadowRadius = UI.get('objectShadowRadius', this.id);
	    this.selected.shadow.radius = objectShadowRadius.getValue();
	};

	ShadowComponent.prototype.updateMaterial = function (material) {
	    if (Array.isArray(material)) {
	        material.forEach(n => {
	            n.needsUpdate = true;
	        });
	    } else {
	        material.needsUpdate = true;
	    }
	};

	ShadowComponent.prototype.onChangeMapSize = function () {
	    var objectMapSize = UI.get('objectMapSize', this.id);
	    var mapSize = objectMapSize.getValue();
	    this.selected.shadow.mapSize.x = this.selected.shadow.mapSize.y = parseInt(mapSize);
	};

	ShadowComponent.prototype.onChangeBias = function () {
	    var objectBias = UI.get('objectBias', this.id);
	    this.selected.shadow.bias = objectBias.getValue();
	};

	ShadowComponent.prototype.onChangeCameraLeft = function () {
	    var objectCameraLeft = UI.get('objectCameraLeft', this.id);
	    this.selected.shadow.camera.left = objectCameraLeft.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	ShadowComponent.prototype.onChangeCameraRight = function () {
	    var objectCameraRight = UI.get('objectCameraRight', this.id);
	    this.selected.shadow.camera.right = objectCameraRight.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	ShadowComponent.prototype.onChangeCameraTop = function () {
	    var objectCameraTop = UI.get('objectCameraTop', this.id);
	    this.selected.shadow.camera.top = objectCameraTop.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	ShadowComponent.prototype.onChangeCameraBottom = function () {
	    var objectCameraBottom = UI.get('objectCameraBottom', this.id);
	    this.selected.shadow.camera.bottom = objectCameraBottom.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	ShadowComponent.prototype.onChangeCameraNear = function () {
	    var objectCameraNear = UI.get('objectCameraNear', this.id);
	    this.selected.shadow.camera.near = objectCameraNear.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	ShadowComponent.prototype.onChangeCameraFar = function () {
	    var objectCameraFar = UI.get('objectCameraFar', this.id);
	    this.selected.shadow.camera.far = objectCameraFar.getValue();
	    this.selected.shadow.camera.updateProjectionMatrix();
	};

	/**
	 * 设置几何体命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newGeometry THREE.Geometry
	 * @constructor
	 */
	function SetGeometryCommand(object, newGeometry) {
		Command.call(this);

		this.type = 'SetGeometryCommand';
		this.name = '设置几何体';
		this.updatable = true;

		this.object = object;
		this.oldGeometry = (object !== undefined) ? object.geometry : undefined;
		this.newGeometry = newGeometry;
	}
	SetGeometryCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetGeometryCommand.prototype, {
		constructor: SetGeometryCommand,

		execute: function () {
			this.object.geometry.dispose();
			this.object.geometry = this.newGeometry;
			this.object.geometry.computeBoundingSphere();

			this.editor.app.call('geometryChanged', this, this.object);
			this.editor.app.call('sceneGraphChanged', this);
		},

		undo: function () {
			this.object.geometry.dispose();
			this.object.geometry = this.oldGeometry;
			this.object.geometry.computeBoundingSphere();

			this.editor.app.call('geometryChanged', this, this.object);
			this.editor.app.call('sceneGraphChanged', this);
		},

		update: function (cmd) {
			this.newGeometry = cmd.newGeometry;
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.oldGeometry = this.object.geometry.toJSON();
			output.newGeometry = this.newGeometry.toJSON();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);

			this.oldGeometry = parseGeometry(json.oldGeometry);
			this.newGeometry = parseGeometry(json.newGeometry);

			function parseGeometry(data) {
				var loader = new THREE.ObjectLoader();
				return loader.parseGeometries([data])[data.uuid];
			}
		}
	});

	/**
	 * 平板组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function PlaneGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	PlaneGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	PlaneGeometryComponent.prototype.constructor = PlaneGeometryComponent;

	PlaneGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '宽度'
	                }, {
	                    xtype: 'number',
	                    id: 'width',
	                    scope: this.id,
	                    value: 1,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '高度'
	                }, {
	                    xtype: 'number',
	                    id: 'height',
	                    scope: this.id,
	                    value: 1,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '宽度分段'
	                }, {
	                    xtype: 'int',
	                    id: 'widthSegments',
	                    scope: this.id,
	                    value: 1,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '高度分段'
	                }, {
	                    xtype: 'int',
	                    id: 'heightSegments',
	                    scope: this.id,
	                    value: 1,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	PlaneGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	PlaneGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	PlaneGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.PlaneBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);

	    width.setValue(this.selected.geometry.parameters.width);
	    height.setValue(this.selected.geometry.parameters.height);
	    widthSegments.setValue(this.selected.geometry.parameters.widthSegments);
	    heightSegments.setValue(this.selected.geometry.parameters.heightSegments);
	};

	PlaneGeometryComponent.prototype.onChangeGeometry = function () {
	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.PlaneBufferGeometry(
	        width.getValue(),
	        height.getValue(),
	        widthSegments.getValue(),
	        heightSegments.getValue()
	    )));
	};

	/**
	 * 正方体组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function BoxGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	BoxGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	BoxGeometryComponent.prototype.constructor = BoxGeometryComponent;

	BoxGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '宽度'
	                }, {
	                    xtype: 'number',
	                    id: 'width',
	                    scope: this.id,
	                    value: 1,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '高度'
	                }, {
	                    xtype: 'number',
	                    id: 'height',
	                    scope: this.id,
	                    value: 1,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '深度'
	                }, {
	                    xtype: 'number',
	                    id: 'depth',
	                    scope: this.id,
	                    value: 1,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '宽度分段'
	                }, {
	                    xtype: 'int',
	                    id: 'widthSegments',
	                    scope: this.id,
	                    value: 1,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '高度分段'
	                }, {
	                    xtype: 'int',
	                    id: 'heightSegments',
	                    scope: this.id,
	                    value: 1,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '深度分段'
	                }, {
	                    xtype: 'int',
	                    id: 'depthSegments',
	                    scope: this.id,
	                    value: 1,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	BoxGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	BoxGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	BoxGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.BoxBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var depth = UI.get('depth', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var depthSegments = UI.get('depthSegments', this.id);

	    width.setValue(this.selected.geometry.parameters.width);
	    height.setValue(this.selected.geometry.parameters.height);
	    depth.setValue(this.selected.geometry.parameters.depth);
	    widthSegments.setValue(this.selected.geometry.parameters.widthSegments);
	    heightSegments.setValue(this.selected.geometry.parameters.heightSegments);
	    depthSegments.setValue(this.selected.geometry.parameters.depthSegments);
	};

	BoxGeometryComponent.prototype.onChangeGeometry = function () {
	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var depth = UI.get('depth', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var depthSegments = UI.get('depthSegments', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.BoxBufferGeometry(
	        width.getValue(),
	        height.getValue(),
	        depth.getValue(),
	        widthSegments.getValue(),
	        heightSegments.getValue(),
	        depthSegments.getValue()
	    )));
	};

	/**
	 * 圆形组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function CircleGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	CircleGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	CircleGeometryComponent.prototype.constructor = CircleGeometryComponent;

	CircleGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'radius',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '分段'
	            }, {
	                xtype: 'int',
	                id: 'segments',
	                scope: this.id,
	                value: 16,
	                range: [3, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始弧度'
	            }, {
	                xtype: 'number',
	                id: 'thetaStart',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '转过弧度'
	            }, {
	                xtype: 'number',
	                id: 'thetaLength',
	                scope: this.id,
	                value: Math.PI * 2,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	CircleGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	CircleGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	CircleGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.CircleBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radius = UI.get('radius', this.id);
	    var segments = UI.get('segments', this.id);
	    var thetaStart = UI.get('thetaStart', this.id);
	    var thetaLength = UI.get('thetaLength', this.id);

	    radius.setValue(this.selected.geometry.parameters.radius);
	    segments.setValue(this.selected.geometry.parameters.segments);
	    thetaStart.setValue(this.selected.geometry.parameters.thetaStart === undefined ? 0 : this.selected.geometry.parameters.thetaStart);
	    thetaLength.setValue(this.selected.geometry.parameters.thetaLength === undefined ? Math.PI * 2 : this.selected.geometry.parameters.thetaLength);
	};

	CircleGeometryComponent.prototype.onChangeGeometry = function () {
	    var radius = UI.get('radius', this.id);
	    var segments = UI.get('segments', this.id);
	    var thetaStart = UI.get('thetaStart', this.id);
	    var thetaLength = UI.get('thetaLength', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.CircleBufferGeometry(
	        radius.getValue(),
	        segments.getValue(),
	        thetaStart.getValue(),
	        thetaLength.getValue()
	    )));
	};

	/**
	 * 圆柱组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function CylinderGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	CylinderGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	CylinderGeometryComponent.prototype.constructor = CylinderGeometryComponent;

	CylinderGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '顶部半径'
	            }, {
	                xtype: 'number',
	                id: 'radiusTop',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '底部半径'
	            }, {
	                xtype: 'number',
	                id: 'radiusBottom',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '高度'
	            }, {
	                xtype: 'number',
	                id: 'height',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '圆形分段'
	            }, {
	                xtype: 'int',
	                id: 'radialSegments',
	                scope: this.id,
	                value: 16,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '高度分段'
	            }, {
	                xtype: 'int',
	                id: 'heightSegments',
	                scope: this.id,
	                value: 1,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '两端开口'
	            }, {
	                xtype: 'checkbox',
	                id: 'openEnded',
	                scope: this.id,
	                value: false,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	CylinderGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	CylinderGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	CylinderGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.CylinderBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radiusTop = UI.get('radiusTop', this.id);
	    var radiusBottom = UI.get('radiusBottom', this.id);
	    var height = UI.get('height', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var openEnded = UI.get('openEnded', this.id);

	    radiusTop.setValue(this.selected.geometry.parameters.radiusTop);
	    radiusBottom.setValue(this.selected.geometry.parameters.radiusBottom);
	    height.setValue(this.selected.geometry.parameters.height);
	    radialSegments.setValue(this.selected.geometry.parameters.radialSegments);
	    heightSegments.setValue(this.selected.geometry.parameters.heightSegments);
	    openEnded.setValue(this.selected.geometry.parameters.openEnded);
	};

	CylinderGeometryComponent.prototype.onChangeGeometry = function () {
	    var radiusTop = UI.get('radiusTop', this.id);
	    var radiusBottom = UI.get('radiusBottom', this.id);
	    var height = UI.get('height', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var openEnded = UI.get('openEnded', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.CylinderBufferGeometry(
	        radiusTop.getValue(),
	        radiusBottom.getValue(),
	        height.getValue(),
	        radialSegments.getValue(),
	        heightSegments.getValue(),
	        openEnded.getValue()
	    )));
	};

	/**
	 * 球体组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SphereGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	SphereGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	SphereGeometryComponent.prototype.constructor = SphereGeometryComponent;

	SphereGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'radius',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '宽度分段'
	            }, {
	                xtype: 'int',
	                id: 'widthSegments',
	                scope: this.id,
	                value: 1,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '高度分段'
	            }, {
	                xtype: 'int',
	                id: 'heightSegments',
	                scope: this.id,
	                value: 1,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始经度'
	            }, {
	                xtype: 'number',
	                id: 'phiStart',
	                scope: this.id,
	                value: 0,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '转过经度'
	            }, {
	                xtype: 'number',
	                id: 'phiLength',
	                scope: this.id,
	                value: Math.PI * 2,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始纬度'
	            }, {
	                xtype: 'number',
	                id: 'thetaStart',
	                scope: this.id,
	                value: 0,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '转过纬度'
	            }, {
	                xtype: 'number',
	                id: 'thetaLength',
	                scope: this.id,
	                value: Math.PI / 2,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	SphereGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	SphereGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	SphereGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.SphereBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radius = UI.get('radius', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var phiStart = UI.get('phiStart', this.id);
	    var phiLength = UI.get('phiLength', this.id);
	    var thetaStart = UI.get('thetaStart', this.id);
	    var thetaLength = UI.get('thetaLength', this.id);

	    radius.setValue(this.selected.geometry.parameters.radius);
	    widthSegments.setValue(this.selected.geometry.parameters.widthSegments);
	    heightSegments.setValue(this.selected.geometry.parameters.heightSegments);
	    phiStart.setValue(this.selected.geometry.parameters.phiStart);
	    phiLength.setValue(this.selected.geometry.parameters.phiLength);
	    thetaStart.setValue(this.selected.geometry.parameters.thetaStart);
	    thetaLength.setValue(this.selected.geometry.parameters.thetaLength);
	};

	SphereGeometryComponent.prototype.onChangeGeometry = function () {
	    var radius = UI.get('radius', this.id);
	    var widthSegments = UI.get('widthSegments', this.id);
	    var heightSegments = UI.get('heightSegments', this.id);
	    var phiStart = UI.get('phiStart', this.id);
	    var phiLength = UI.get('phiLength', this.id);
	    var thetaStart = UI.get('thetaStart', this.id);
	    var thetaLength = UI.get('thetaLength', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.SphereBufferGeometry(
	        radius.getValue(),
	        widthSegments.getValue(),
	        heightSegments.getValue(),
	        phiStart.getValue(),
	        phiLength.getValue(),
	        thetaStart.getValue(),
	        thetaLength.getValue()
	    )));
	};

	/**
	 * 二十面体组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function IcosahedronGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	IcosahedronGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	IcosahedronGeometryComponent.prototype.constructor = IcosahedronGeometryComponent;

	IcosahedronGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'radius',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '面片分段'
	            }, {
	                xtype: 'int',
	                id: 'detail',
	                scope: this.id,
	                value: 1,
	                range: [0, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	IcosahedronGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	IcosahedronGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	IcosahedronGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.IcosahedronBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radius = UI.get('radius', this.id);
	    var detail = UI.get('detail', this.id);

	    radius.setValue(this.selected.geometry.parameters.radius);
	    detail.setValue(this.selected.geometry.parameters.detail);
	};

	IcosahedronGeometryComponent.prototype.onChangeGeometry = function () {
	    var radius = UI.get('radius', this.id);
	    var detail = UI.get('detail', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.IcosahedronBufferGeometry(
	        radius.getValue(),
	        detail.getValue()
	    )));
	};

	/**
	 * 花托组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TorusGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	TorusGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	TorusGeometryComponent.prototype.constructor = TorusGeometryComponent;

	TorusGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'radius',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管粗'
	            }, {
	                xtype: 'number',
	                id: 'tube',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管粗分段'
	            }, {
	                xtype: 'int',
	                id: 'radialSegments',
	                scope: this.id,
	                value: 16,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径分段'
	            }, {
	                xtype: 'int',
	                id: 'tubularSegments',
	                scope: this.id,
	                value: 16,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '旋转弧度'
	            }, {
	                xtype: 'number',
	                id: 'arc',
	                scope: this.id,
	                value: Math.PI * 2,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	TorusGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	TorusGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	TorusGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.TorusBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radius = UI.get('radius', this.id);
	    var tube = UI.get('tube', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var tubularSegments = UI.get('tubularSegments', this.id);
	    var arc = UI.get('arc', this.id);

	    radius.setValue(this.selected.geometry.parameters.radius);
	    tube.setValue(this.selected.geometry.parameters.tube);
	    radialSegments.setValue(this.selected.geometry.parameters.radialSegments);
	    tubularSegments.setValue(this.selected.geometry.parameters.tubularSegments);
	    arc.setValue(this.selected.geometry.parameters.arc);
	};

	TorusGeometryComponent.prototype.onChangeGeometry = function () {
	    var radius = UI.get('radius', this.id);
	    var tube = UI.get('tube', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var tubularSegments = UI.get('tubularSegments', this.id);
	    var arc = UI.get('arc', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.TorusBufferGeometry(
	        radius.getValue(),
	        tube.getValue(),
	        radialSegments.getValue(),
	        tubularSegments.getValue(),
	        arc.getValue()
	    )));
	};

	/**
	 * 环面纽结组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TorusKnotGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	TorusKnotGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	TorusKnotGeometryComponent.prototype.constructor = TorusKnotGeometryComponent;

	TorusKnotGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半径'
	            }, {
	                xtype: 'number',
	                id: 'radius',
	                scope: this.id,
	                value: 16,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管粗'
	            }, {
	                xtype: 'number',
	                id: 'tube',
	                scope: this.id,
	                value: 1,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管长分段'
	            }, {
	                xtype: 'int',
	                id: 'tubularSegments',
	                scope: this.id,
	                value: 16,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管粗分段'
	            }, {
	                xtype: 'int',
	                id: 'radialSegments',
	                scope: this.id,
	                value: 16,
	                range: [1, Infinity],
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '管长弧度'
	            }, {
	                xtype: 'number',
	                id: 'p',
	                scope: this.id,
	                value: 20,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '扭曲弧度'
	            }, {
	                xtype: 'number',
	                id: 'q',
	                scope: this.id,
	                value: 20,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	TorusKnotGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	TorusKnotGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	TorusKnotGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.TorusKnotBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var radius = UI.get('radius', this.id);
	    var tube = UI.get('tube', this.id);
	    var tubularSegments = UI.get('tubularSegments', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var p = UI.get('p', this.id);
	    var q = UI.get('q', this.id);

	    radius.setValue(this.selected.geometry.parameters.radius);
	    tube.setValue(this.selected.geometry.parameters.tube);
	    tubularSegments.setValue(this.selected.geometry.parameters.tubularSegments);
	    radialSegments.setValue(this.selected.geometry.parameters.radialSegments);
	    p.setValue(this.selected.geometry.parameters.p);
	    q.setValue(this.selected.geometry.parameters.q);
	};

	TorusKnotGeometryComponent.prototype.onChangeGeometry = function () {
	    var radius = UI.get('radius', this.id);
	    var tube = UI.get('tube', this.id);
	    var tubularSegments = UI.get('tubularSegments', this.id);
	    var radialSegments = UI.get('radialSegments', this.id);
	    var p = UI.get('p', this.id);
	    var q = UI.get('q', this.id);

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.TorusKnotBufferGeometry(
	        radius.getValue(),
	        tube.getValue(),
	        tubularSegments.getValue(),
	        radialSegments.getValue(),
	        p.getValue(),
	        q.getValue()
	    )));
	};

	/**
	 * 车床组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function LatheGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	LatheGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	LatheGeometryComponent.prototype.constructor = LatheGeometryComponent;

	LatheGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '径向分段'
	            }, {
	                xtype: 'int',
	                id: 'segments',
	                scope: this.id,
	                value: 16,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始弧度'
	            }, {
	                xtype: 'number',
	                id: 'phiStart',
	                scope: this.id,
	                value: 0,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '转过弧度'
	            }, {
	                xtype: 'number',
	                id: 'phiLength',
	                scope: this.id,
	                value: Math.PI * 2,
	                onChange: this.onChangeGeometry.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	LatheGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	LatheGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	LatheGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.LatheBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var segments = UI.get('segments', this.id);
	    var phiStart = UI.get('phiStart', this.id);
	    var phiLength = UI.get('phiLength', this.id);

	    segments.setValue(this.selected.geometry.parameters.segments);
	    phiStart.setValue(this.selected.geometry.parameters.phiStart);
	    phiLength.setValue(this.selected.geometry.parameters.phiLength);
	};

	LatheGeometryComponent.prototype.onChangeGeometry = function () {
	    var segments = UI.get('segments', this.id);
	    var phiStart = UI.get('phiStart', this.id);
	    var phiLength = UI.get('phiLength', this.id);

	    var points = this.selected.geometry.parameters.points;

	    this.app.editor.execute(new SetGeometryCommand(this.selected, new THREE.LatheBufferGeometry(
	        points,
	        segments.getValue(),
	        phiStart.getValue(),
	        phiLength.getValue()
	    )));
	};

	/**
	 * 茶壶组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TeapotGeometryComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	TeapotGeometryComponent.prototype = Object.create(BaseComponent.prototype);
	TeapotGeometryComponent.prototype.constructor = TeapotGeometryComponent;

	TeapotGeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        style: {
	            borderTop: 0,
	            marginTop: '8px',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '尺寸'
	                }, {
	                    xtype: 'number',
	                    id: 'size',
	                    scope: this.id,
	                    value: 3,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '分段'
	                }, {
	                    xtype: 'int',
	                    id: 'segments',
	                    scope: this.id,
	                    value: 10,
	                    range: [1, Infinity],
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '壶底'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'bottom',
	                    scope: this.id,
	                    value: true,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '壶盖'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'lid',
	                    scope: this.id,
	                    value: true,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '壶身'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'body',
	                    scope: this.id,
	                    value: true,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '壶盖填满'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'fitLid',
	                    scope: this.id,
	                    value: true,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }, {
	                xtype: 'row',
	                children: [{
	                    xtype: 'label',
	                    text: '布林'
	                }, {
	                    xtype: 'checkbox',
	                    id: 'blinn',
	                    scope: this.id,
	                    value: true,
	                    onChange: this.onChangeGeometry.bind(this)
	                }]
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	TeapotGeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	TeapotGeometryComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	TeapotGeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.geometry instanceof THREE.TeapotBufferGeometry) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var size = UI.get('size', this.id);
	    var segments = UI.get('segments', this.id);
	    var bottom = UI.get('bottom', this.id);
	    var lid = UI.get('lid', this.id);
	    var body = UI.get('body', this.id);
	    var fitLid = UI.get('fitLid', this.id);
	    var blinn = UI.get('blinn', this.id);

	    size.setValue(this.selected.geometry.parameters.size);
	    segments.setValue(this.selected.geometry.parameters.segments);
	    bottom.setValue(this.selected.geometry.parameters.bottom);
	    lid.setValue(this.selected.geometry.parameters.lid);
	    body.setValue(this.selected.geometry.parameters.body);
	    fitLid.setValue(this.selected.geometry.parameters.fitLid);
	    blinn.setValue(this.selected.geometry.parameters.blinn);
	};

	TeapotGeometryComponent.prototype.onChangeGeometry = function () {
	    var size = UI.get('size', this.id);
	    var segments = UI.get('segments', this.id);
	    var bottom = UI.get('bottom', this.id);
	    var lid = UI.get('lid', this.id);
	    var body = UI.get('body', this.id);
	    var fitLid = UI.get('fitLid', this.id);
	    var blinn = UI.get('blinn', this.id);

	    var geometry = new THREE.TeapotBufferGeometry(
	        size.getValue(),
	        segments.getValue(),
	        bottom.getValue(),
	        lid.getValue(),
	        body.getValue(),
	        fitLid.getValue(),
	        blinn.getValue()
	    );

	    geometry.type = 'TeapotBufferGeometry';

	    geometry.parameters = {
	        size: size.getValue(),
	        segments: segments.getValue(),
	        bottom: bottom.getValue(),
	        lid: lid.getValue(),
	        body: body.getValue(),
	        fitLid: fitLid.getValue(),
	        blinn: blinn.getValue()
	    };

	    this.app.editor.execute(new SetGeometryCommand(this.selected, geometry));
	};

	/**
	 * 几何体组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function GeometryComponent(options) {
	    BaseComponent.call(this, options);
	}

	GeometryComponent.prototype = Object.create(BaseComponent.prototype);
	GeometryComponent.prototype.constructor = GeometryComponent;

	GeometryComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'geometryPanel',
	        scope: this.id,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '几何组件'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'text',
	                id: 'name',
	                scope: this.id,
	                text: ''
	            }]
	        },
	        new PlaneGeometryComponent({ app: this.app }),
	        new BoxGeometryComponent({ app: this.app }),
	        new CircleGeometryComponent({ app: this.app }),
	        new CylinderGeometryComponent({ app: this.app }),
	        new SphereGeometryComponent({ app: this.app }),
	        new IcosahedronGeometryComponent({ app: this.app }),
	        new TorusGeometryComponent({ app: this.app }),
	        new TorusKnotGeometryComponent({ app: this.app }),
	        new LatheGeometryComponent({ app: this.app }),
	        new TeapotGeometryComponent({ app: this.app })
	        ]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	};

	GeometryComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	GeometryComponent.prototype.updateUI = function () {
	    var container = UI.get('geometryPanel', this.id);
	    var editor = this.app.editor;

	    var name = UI.get('name', this.id);

	    if (editor.selected && editor.selected instanceof THREE.Mesh) {
	        container.dom.style.display = '';
	        if (editor.selected.geometry instanceof THREE.TeapotBufferGeometry) {
	            name.setValue('TeapotBufferGeometry');
	        } else {
	            name.setValue(editor.selected.geometry.constructor.name);
	        }
	    } else {
	        container.dom.style.display = 'none';
	        name.setValue('');
	    }
	};

	/**
	 * 设置材质命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param newMaterial THREE.Material
	 * @constructor
	 */
	function SetMaterialCommand(object, newMaterial) {
		Command.call(this);

		this.type = 'SetMaterialCommand';
		this.name = '新材质';

		this.object = object;
		this.oldMaterial = (object !== undefined) ? object.material : undefined;
		this.newMaterial = newMaterial;
	}
	SetMaterialCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetMaterialCommand.prototype, {
		constructor: SetMaterialCommand,

		execute: function () {
			this.object.material = this.newMaterial;
			this.editor.app.call('materialChanged', this, this.newMaterial);
		},

		undo: function () {
			this.object.material = this.oldMaterial;
			this.editor.app.call('materialChanged', this, this.oldMaterial);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.oldMaterial = this.oldMaterial.toJSON();
			output.newMaterial = this.newMaterial.toJSON();

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.oldMaterial = parseMaterial(json.oldMaterial);
			this.newMaterial = parseMaterial(json.newMaterial);

			function parseMaterial(json) {
				var loader = new THREE.ObjectLoader();
				var images = loader.parseImages(json.images);
				var textures = loader.parseTextures(json.textures, images);
				var materials = loader.parseMaterials([json], textures);
				return materials[json.uuid];
			}
		}
	});

	/**
	 * 设置材质颜色命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue integer representing a hex color value
	 * @constructor
	 */
	function SetMaterialColorCommand(object, attributeName, newValue) {
		Command.call(this);

		this.type = 'SetMaterialColorCommand';
		this.name = '设置材质.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = (object !== undefined) ? this.object.material[this.attributeName].getHex() : undefined;
		this.newValue = newValue;
	}
	SetMaterialColorCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetMaterialColorCommand.prototype, {
		constructor: SetMaterialColorCommand,

		execute: function () {
			this.object.material[this.attributeName].setHex(this.newValue);
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		undo: function () {
			this.object.material[this.attributeName].setHex(this.oldValue);
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		update: function (cmd) {
			this.newValue = cmd.newValue;
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
		}
	});

	/**
	 * 设置材质值命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param attributeName string
	 * @param newValue number, string, boolean or object
	 * @constructor
	 */
	function SetMaterialValueCommand(object, attributeName, newValue) {
		Command.call(this);

		this.type = 'SetMaterialValueCommand';
		this.name = '设置材质.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.oldValue = (object !== undefined) ? object.material[attributeName] : undefined;
		this.newValue = newValue;
		this.attributeName = attributeName;
	}
	SetMaterialValueCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetMaterialValueCommand.prototype, {
		constructor: SetMaterialValueCommand,

		execute: function () {
			this.object.material[this.attributeName] = this.newValue;
			this.object.material.needsUpdate = true;
			this.editor.app.call('objectChanged', this, this.object);
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		undo: function () {
			this.object.material[this.attributeName] = this.oldValue;
			this.object.material.needsUpdate = true;
			this.editor.app.call('objectChanged', this, this.object);
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		update: function (cmd) {
			this.newValue = cmd.newValue;
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.attributeName = json.attributeName;
			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.object = this.editor.objectByUuid(json.objectUuid);
		}
	});

	/**
	 * 设置材质纹理命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param mapName string
	 * @param newMap THREE.Texture
	 * @constructor
	 */
	function SetMaterialMapCommand(object, mapName, newMap) {
		Command.call(this);

		this.type = 'SetMaterialMapCommand';
		this.name = '设置材质.' + mapName;

		this.object = object;
		this.mapName = mapName;
		this.oldMap = (object !== undefined) ? object.material[mapName] : undefined;
		this.newMap = newMap;
	}
	SetMaterialMapCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetMaterialMapCommand.prototype, {
		constructor: SetMaterialMapCommand,

		execute: function () {
			this.object.material[this.mapName] = this.newMap;
			this.object.material.needsUpdate = true;
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		undo: function () {
			this.object.material[this.mapName] = this.oldMap;
			this.object.material.needsUpdate = true;
			this.editor.app.call('materialChanged', this, this.object.material);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.mapName = this.mapName;
			output.newMap = serializeMap(this.newMap);
			output.oldMap = serializeMap(this.oldMap);

			return output;

			// serializes a map (THREE.Texture)

			function serializeMap(map) {
				if (map === null || map === undefined) return null;

				var meta = {
					geometries: {},
					materials: {},
					textures: {},
					images: {}
				};

				var json = map.toJSON(meta);
				var images = extractFromCache(meta.images);
				if (images.length > 0) json.images = images;
				json.sourceFile = map.sourceFile;

				return json;
			}

			// Note: The function 'extractFromCache' is copied from Object3D.toJSON()

			// extract data from the cache hash
			// remove metadata on each item
			// and return as array
			function extractFromCache(cache) {
				var values = [];
				for (var key in cache) {

					var data = cache[key];
					delete data.metadata;
					values.push(data);

				}
				return values;
			}
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.object = this.editor.objectByUuid(json.objectUuid);
			this.mapName = json.mapName;
			this.oldMap = parseTexture(json.oldMap);
			this.newMap = parseTexture(json.newMap);

			function parseTexture(json) {
				var map = null;
				if (json !== null) {

					var loader = new THREE.ObjectLoader();
					var images = loader.parseImages(json.images);
					var textures = loader.parseTextures([json], images);
					map = textures[json.uuid];
					map.sourceFile = json.sourceFile;

				}
				return map;
			}
		}
	});

	var ShaderMaterialVertex = "void main()\t{\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

	var ShaderMaterialFragment = "void main()\t{\r\n\tgl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\r\n}";

	var RawShaderMaterialVertex = "precision mediump float;\r\n\r\nuniform mat4 modelViewMatrix;\r\nuniform mat4 projectionMatrix;\r\n\r\nattribute vec3 position;\r\n\r\nvoid main()\t{\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";

	var RawShaderMaterialFragment = "precision mediump float;\r\n\r\nvoid main()\t{\r\n\tgl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\r\n}";

	/**
	 * 纹理选择控件
	 * @param {*} options 
	 */
	function TextureSelectControl(options) {
	    Control.call(this, options);

	    this.app = options.app;

	    this.texture = null;

	    this.onChange = options.onChange || null;
	}

	TextureSelectControl.prototype = Object.create(Control.prototype);
	TextureSelectControl.prototype.constructor = TextureSelectControl;

	TextureSelectControl.prototype.render = function () {
	    this.dom = document.createElement('div');
	    this.dom.className = 'Texture';

	    this.canvas = document.createElement('canvas');
	    this.canvas.width = 32;
	    this.canvas.height = 16;
	    this.dom.appendChild(this.canvas);

	    this.canvas.addEventListener('click', this.onClick.bind(this));

	    this.name = document.createElement('input');
	    this.name.disabled = true;
	    this.dom.appendChild(this.name);

	    this.parent.appendChild(this.dom);
	};

	TextureSelectControl.prototype.updateUI = function () {
	    var canvas = this.dom.children[0];
	    var name = this.dom.children[1];
	    var context = canvas.getContext('2d');

	    var texture = this.texture;

	    if (texture !== undefined && texture !== null) {
	        var image = texture.image;

	        if (image !== undefined && image.width > 0) {
	            name.value = texture.name;

	            var scale = canvas.width / image.width;
	            context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
	        } else {
	            name.value = '无图片';
	            context.clearRect(0, 0, canvas.width, canvas.height);
	        }

	    } else {
	        name.value = '';

	        if (context !== null) {
	            context.clearRect(0, 0, canvas.width, canvas.height);
	        }
	    }
	};

	TextureSelectControl.prototype.getValue = function () {
	    return this.texture;
	};

	TextureSelectControl.prototype.setValue = function (texture) {
	    this.texture = texture;
	    this.updateUI();
	};

	TextureSelectControl.prototype.onClick = function () {
	    if (this.window === undefined) {
	        this.window = new TextureWindow({
	            app: this.app,
	            onSelect: this.onSelect.bind(this)
	        });
	        this.window.render();
	    }
	    this.window.show();
	};

	TextureSelectControl.prototype.onSelect = function (data) {
	    var urls = data.Url.split(';'); // 立体贴图data.Url多于一张，只取第一个。

	    var loader = new THREE.TextureLoader();
	    loader.load(`${this.app.options.server}${urls[0]}`, texture => {
	        this.texture = texture;
	        this.texture.name = data.Name;
	        this.window.hide();
	        this.updateUI();
	        this.onChange();
	    });
	};

	/**
	 * 纹理设置窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextureSettingWindow(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}

	TextureSettingWindow.prototype = Object.create(UI$1.Control.prototype);
	TextureSettingWindow.prototype.constructor = TextureSettingWindow;

	TextureSettingWindow.prototype.render = function () {
	    this.window = UI$1.create({
	        xtype: 'window',
	        title: '纹理设置',
	        width: '300px',
	        height: '450px',
	        bodyStyle: {
	            padding: 0
	        },
	        shade: false,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '偏移'
	            }, {
	                xtype: 'number',
	                id: 'offsetX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'offsetY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '旋转中心'
	            }, {
	                xtype: 'number',
	                id: 'centerX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'centerY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '旋转'
	            }, {
	                xtype: 'number',
	                id: 'rotation',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '横向填充'
	            }, {
	                xtype: 'select',
	                id: 'wrapS',
	                scope: this.id,
	                options: {
	                    [THREE.ClampToEdgeWrapping]: '拉伸',
	                    [THREE.RepeatWrapping]: '重复',
	                    [THREE.MirroredRepeatWrapping]: '镜像'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '纵向填充'
	            }, {
	                xtype: 'select',
	                id: 'wrapT',
	                scope: this.id,
	                options: {
	                    [THREE.ClampToEdgeWrapping]: '拉伸',
	                    [THREE.RepeatWrapping]: '重复',
	                    [THREE.MirroredRepeatWrapping]: '镜像'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '填充次数'
	            }, {
	                xtype: 'int',
	                id: 'repeatX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'int',
	                id: 'repeatY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '反转Y'
	            }, {
	                xtype: 'checkbox',
	                id: 'flipY',
	                scope: this.id,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '放大过滤'
	            }, {
	                xtype: 'select',
	                id: 'magFilter',
	                scope: this.id,
	                options: {
	                    [THREE.LinearFilter]: 'LinearFilter',
	                    [THREE.NearestFilter]: 'NearestFilter'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '缩小过滤'
	            }, {
	                xtype: 'select',
	                id: 'minFilter',
	                scope: this.id,
	                options: {
	                    [THREE.LinearMipMapLinearFilter]: 'LinearMipMapLinearFilter',
	                    [THREE.NearestFilter]: 'NearestFilter',
	                    [THREE.NearestMipMapNearestFilter]: 'NearestMipMapNearestFilter',
	                    [THREE.NearestMipMapLinearFilter]: 'NearestMipMapLinearFilter',
	                    [THREE.LinearFilter]: 'LinearFilter',
	                    [THREE.LinearMipMapNearestFilter]: 'LinearMipMapNearestFilter'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'select',
	                id: 'type',
	                scope: this.id,
	                options: {
	                    [THREE.UnsignedByteType]: 'UnsignedByteType',
	                    [THREE.ByteType]: 'ByteType',
	                    [THREE.ShortType]: 'ShortType',
	                    [THREE.UnsignedShortType]: 'UnsignedShortType',
	                    [THREE.IntType]: 'IntType',
	                    [THREE.UnsignedIntType]: 'UnsignedIntType',
	                    [THREE.FloatType]: 'FloatType',
	                    [THREE.HalfFloatType]: 'HalfFloatType',
	                    [THREE.UnsignedShort4444Type]: 'UnsignedShort4444Type',
	                    [THREE.UnsignedShort5551Type]: 'UnsignedShort5551Type',
	                    [THREE.UnsignedShort565Type]: 'UnsignedShort565Type',
	                    [THREE.UnsignedInt248Type]: 'UnsignedInt248Type'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '编码'
	            }, {
	                xtype: 'select',
	                id: 'encoding',
	                scope: this.id,
	                options: {
	                    [THREE.LinearEncoding]: 'LinearEncoding',
	                    [THREE.sRGBEncoding]: 'sRGBEncoding',
	                    [THREE.GammaEncoding]: 'GammaEncoding',
	                    [THREE.RGBEEncoding]: 'RGBEEncoding',
	                    [THREE.LogLuvEncoding]: 'LogLuvEncoding',
	                    [THREE.RGBM7Encoding]: 'RGBM7Encoding',
	                    [THREE.RGBM16Encoding]: 'RGBM16Encoding',
	                    [THREE.RGBDEncoding]: 'RGBDEncoding',
	                    [THREE.BasicDepthPacking]: 'BasicDepthPacking',
	                    [THREE.RGBADepthPacking]: 'RGBADepthPacking'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '格式'
	            }, {
	                xtype: 'select',
	                id: 'format',
	                scope: this.id,
	                options: {
	                    [THREE.RGBAFormat]: 'RGBAFormat',
	                    [THREE.AlphaFormat]: 'AlphaFormat',
	                    [THREE.RGBFormat]: 'RGBFormat',
	                    [THREE.LuminanceFormat]: 'LuminanceFormat',
	                    [THREE.LuminanceAlphaFormat]: 'LuminanceAlphaFormat',
	                    [THREE.RGBEFormat]: 'RGBEFormat',
	                    [THREE.DepthFormat]: 'DepthFormat',
	                    [THREE.DepthStencilFormat]: 'DepthStencilFormat'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开启层级'
	            }, {
	                xtype: 'checkbox',
	                id: 'generateMipmaps',
	                scope: this.id,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '映射'
	            }, {
	                xtype: 'select',
	                id: 'mapping',
	                scope: this.id,
	                options: {
	                    [THREE.UVMapping]: 'UVMapping',
	                    [THREE.CubeReflectionMapping]: 'CubeReflectionMapping',
	                    [THREE.CubeRefractionMapping]: 'CubeRefractionMapping',
	                    [THREE.EquirectangularReflectionMapping]: 'EquirectangularReflectionMapping',
	                    [THREE.EquirectangularRefractionMapping]: 'EquirectangularRefractionMapping',
	                    [THREE.SphericalReflectionMapping]: 'SphericalReflectionMapping',
	                    [THREE.CubeUVReflectionMapping]: 'CubeUVReflectionMapping',
	                    [THREE.CubeUVRefractionMapping]: 'CubeUVRefractionMapping'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '左乘透明'
	            }, {
	                xtype: 'checkbox',
	                id: 'premultiplyAlpha',
	                scope: this.id,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '解压对齐'
	            }, {
	                xtype: 'select',
	                id: 'unpackAlignment',
	                scope: this.id,
	                options: {
	                    [4]: '4',
	                    [1]: '1',
	                    [2]: '2',
	                    [8]: '8'
	                },
	                style: {
	                    width: '160px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '各向异性'
	            }, {
	                xtype: 'int',
	                id: 'anisotropy',
	                scope: this.id,
	                style: {
	                    width: '80px'
	                },
	                range: [1, 16],
	                onChange: this.onChange.bind(this)
	            }]
	        }]
	    });
	    this.window.render();
	};

	TextureSettingWindow.prototype.show = function () {
	    this.window.show();
	};

	TextureSettingWindow.prototype.hide = function () {
	    this.window.hide();
	};

	TextureSettingWindow.prototype.setData = function (texture) {
	    var anisotropy = UI$1.get('anisotropy', this.id);
	    var centerX = UI$1.get('centerX', this.id);
	    var centerY = UI$1.get('centerY', this.id);
	    var offsetX = UI$1.get('offsetX', this.id);
	    var offsetY = UI$1.get('offsetY', this.id);
	    var repeatX = UI$1.get('repeatX', this.id);
	    var repeatY = UI$1.get('repeatY', this.id);
	    var rotation = UI$1.get('rotation', this.id);
	    var type = UI$1.get('type', this.id);
	    var encoding = UI$1.get('encoding', this.id);
	    var flipY = UI$1.get('flipY', this.id);
	    var format = UI$1.get('format', this.id);
	    var generateMipmaps = UI$1.get('generateMipmaps', this.id);
	    var magFilter = UI$1.get('magFilter', this.id);
	    var minFilter = UI$1.get('minFilter', this.id);
	    var mapping = UI$1.get('mapping', this.id);
	    var premultiplyAlpha = UI$1.get('premultiplyAlpha', this.id);
	    var unpackAlignment = UI$1.get('unpackAlignment', this.id);
	    var wrapS = UI$1.get('wrapS', this.id);
	    var wrapT = UI$1.get('wrapT', this.id);

	    this.texture = texture;

	    anisotropy.setValue(texture.anisotropy);
	    centerX.setValue(texture.center.x);
	    centerY.setValue(texture.center.y);
	    offsetX.setValue(texture.offset.x);
	    offsetY.setValue(texture.offset.y);
	    repeatX.setValue(texture.repeat.x);
	    repeatY.setValue(texture.repeat.y);
	    rotation.setValue(texture.rotation);
	    type.setValue(texture.type);
	    encoding.setValue(texture.encoding);
	    flipY.setValue(texture.flipY);
	    format.setValue(texture.format);
	    generateMipmaps.setValue(texture.generateMipmaps);
	    magFilter.setValue(texture.magFilter);
	    minFilter.setValue(texture.minFilter);
	    mapping.setValue(texture.mapping);
	    premultiplyAlpha.setValue(texture.premultiplyAlpha);
	    unpackAlignment.setValue(texture.unpackAlignment);
	    wrapS.setValue(texture.wrapS);
	    wrapT.setValue(texture.wrapT);
	};

	TextureSettingWindow.prototype.onChange = function () {
	    var anisotropy = UI$1.get('anisotropy', this.id);
	    var centerX = UI$1.get('centerX', this.id);
	    var centerY = UI$1.get('centerY', this.id);
	    var offsetX = UI$1.get('offsetX', this.id);
	    var offsetY = UI$1.get('offsetY', this.id);
	    var repeatX = UI$1.get('repeatX', this.id);
	    var repeatY = UI$1.get('repeatY', this.id);
	    var rotation = UI$1.get('rotation', this.id);
	    var type = UI$1.get('type', this.id);
	    var encoding = UI$1.get('encoding', this.id);
	    var flipY = UI$1.get('flipY', this.id);
	    var format = UI$1.get('format', this.id);
	    var generateMipmaps = UI$1.get('generateMipmaps', this.id);
	    var magFilter = UI$1.get('magFilter', this.id);
	    var minFilter = UI$1.get('minFilter', this.id);
	    var mapping = UI$1.get('mapping', this.id);
	    var premultiplyAlpha = UI$1.get('premultiplyAlpha', this.id);
	    var unpackAlignment = UI$1.get('unpackAlignment', this.id);
	    var wrapS = UI$1.get('wrapS', this.id);
	    var wrapT = UI$1.get('wrapT', this.id);

	    var texture = this.texture;

	    texture.anisotropy = anisotropy.getValue();
	    texture.center.x = centerX.getValue();
	    texture.center.y = centerY.getValue();
	    texture.offset.x = offsetX.getValue();
	    texture.offset.y = offsetY.getValue();
	    texture.repeat.x = repeatX.getValue();
	    texture.repeat.y = repeatY.getValue();
	    texture.rotation = rotation.getValue();
	    texture.type = parseInt(type.getValue());
	    texture.encoding = parseInt(encoding.getValue());
	    texture.flipY = flipY.getValue();
	    texture.format = parseInt(format.getValue());
	    texture.generateMipmaps = generateMipmaps.getValue();
	    texture.magFilter = parseInt(magFilter.getValue());
	    texture.minFilter = parseInt(minFilter.getValue());
	    texture.mapping = parseInt(mapping.getValue());
	    texture.premultiplyAlpha = premultiplyAlpha.getValue();
	    texture.unpackAlignment = parseInt(unpackAlignment.getValue());
	    texture.wrapS = parseInt(wrapS.getValue());
	    texture.wrapT = parseInt(wrapT.getValue());

	    texture.needsUpdate = true;
	};

	/**
	 * 材质组件
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function MaterialComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	MaterialComponent.prototype = Object.create(BaseComponent.prototype);
	MaterialComponent.prototype.constructor = MaterialComponent;

	MaterialComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'materialPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '材质组件'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'select',
	                id: 'type',
	                scope: this.id,
	                options: {
	                    'LineBasicMaterial': '线条材质',
	                    'LineDashedMaterial': '虚线材质',
	                    'MeshBasicMaterial': '基本材质',
	                    'MeshDepthMaterial': '深度材质',
	                    'MeshNormalMaterial': '法向量材质',
	                    'MeshLambertMaterial': '兰伯特材质',
	                    'MeshPhongMaterial': '冯氏材质',
	                    'PointCloudMaterial': '点云材质',
	                    'MeshStandardMaterial': '标准材质',
	                    'MeshPhysicalMaterial': '物理材质',
	                    'SpriteMaterial': '精灵材质',
	                    'ShaderMaterial': '着色器材质',
	                    'RawShaderMaterial': '原始着色器材质'
	                },
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'programRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '着色程序'
	            }, {
	                xtype: 'button',
	                scope: this.id,
	                text: '信息',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: this.editProgramInfo.bind(this)
	            }, {
	                xtype: 'button',
	                scope: this.id,
	                text: '顶点',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: this.editVertexShader.bind(this)
	            }, {
	                xtype: 'button',
	                scope: this.id,
	                text: '片源',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: this.editFragmentShader.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'colorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '颜色'
	            }, {
	                xtype: 'color',
	                id: 'color',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'roughnessRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '粗糙度'
	            }, {
	                xtype: 'number',
	                id: 'roughness',
	                scope: this.id,
	                value: 0.5,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'metalnessRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '金属度'
	            }, {
	                xtype: 'number',
	                id: 'metalness',
	                scope: this.id,
	                value: 0.5,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'emissiveRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '发光'
	            }, {
	                xtype: 'color',
	                id: 'emissive',
	                scope: this.id,
	                value: 0x000000,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'specularRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '镜面度'
	            }, {
	                xtype: 'color',
	                id: 'specular',
	                scope: this.id,
	                value: 0x111111,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'shininessRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '光亮度'
	            }, {
	                xtype: 'number',
	                id: 'shininess',
	                scope: this.id,
	                value: 30,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'clearCoatRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '透明度'
	            }, {
	                xtype: 'number',
	                id: 'clearCoat',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'clearCoatRoughnessRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '透明粗糙度'
	            }, {
	                xtype: 'number',
	                id: 'clearCoatRoughness',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'vertexColorsRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '顶点颜色'
	            }, {
	                xtype: 'select',
	                id: 'vertexColors',
	                scope: this.id,
	                options: {
	                    0: '无',
	                    1: '面',
	                    2: '顶点'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'skinningRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '皮肤'
	            }, {
	                xtype: 'checkbox',
	                id: 'skinning',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'mapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'mapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            },
	            new TextureSelectControl({
	                app: this.app,
	                id: 'map',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }), {
	                xtype: 'linkbutton',
	                text: '设置',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: this.onSetMap.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'alphaMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '透明纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'alphaMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'alphaMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'bumpMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '凹凸纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'bumpMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'bumpMap',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '30px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'bumpScale',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '30px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'normalMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '法线纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'normalMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'normalMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'displacementMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '位移纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'displacementMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'displacementMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'displacementScale',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '30px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'roughnessMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '粗糙纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'roughnessMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'roughnessMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'metalnessMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '金属纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'metalnessMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'metalnessMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'specularMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '镜面纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'specularMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'specularMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'envMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '环境纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'envMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'envMap',
	                scope: this.id,
	                mapping: THREE.SphericalReflectionMapping,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'reflectivity',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '30px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'lightMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '光照纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'lightMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'lightMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'aoMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '遮挡纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'aoMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'aoMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'aoScale',
	                scope: this.id,
	                value: 1,
	                range: [0, 1],
	                style: {
	                    width: '30px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'emissiveMapRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '放射纹理'
	            }, {
	                xtype: 'checkbox',
	                id: 'emissiveMapEnabled',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'texture',
	                id: 'emissiveMap',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'sideRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '剔除'
	            }, {
	                xtype: 'select',
	                id: 'side',
	                scope: this.id,
	                options: {
	                    0: '正面',
	                    1: '反面',
	                    2: '双面'
	                },
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'flatShadingRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '平滑'
	            }, {
	                xtype: 'checkbox',
	                id: 'flatShading',
	                scope: this.id,
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'blendingRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '混合'
	            }, {
	                xtype: 'select',
	                id: 'blending',
	                scope: this.id,
	                options: {
	                    0: '不混合',
	                    1: '一般混合',
	                    2: '和混合',
	                    3: '差混合',
	                    4: '积混合',
	                    5: '自定义混合'
	                },
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'opacityRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '不透明度'
	            }, {
	                xtype: 'number',
	                id: 'opacity',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'transparentRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '透明'
	            }, {
	                xtype: 'checkbox',
	                id: 'transparent',
	                scope: this.id,
	                style: {
	                    left: '100px'
	                },
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'alphaTestRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'α测试'
	            }, {
	                xtype: 'number',
	                id: 'alphaTest',
	                scope: this.id,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 1],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'wireframeRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '线框'
	            }, {
	                xtype: 'checkbox',
	                id: 'wireframe',
	                scope: this.id,
	                value: false,
	                onChange: this.updateMaterial.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'wireframeLinewidth',
	                scope: this.id,
	                value: 1,
	                style: {
	                    width: '60px'
	                },
	                range: [0, 100],
	                onChange: this.updateMaterial.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	MaterialComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	MaterialComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	MaterialComponent.prototype.updateUI = function () {
	    var container = UI.get('materialPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && (editor.selected instanceof THREE.Mesh || editor.selected instanceof THREE.Sprite) && !Array.isArray(editor.selected.material)) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    this.setRowVisibility();
	    this.setRowValue();
	};

	MaterialComponent.prototype.setRowVisibility = function () {
	    var programRow = UI.get('programRow', this.id);
	    var colorRow = UI.get('colorRow', this.id);
	    var roughnessRow = UI.get('roughnessRow', this.id);
	    var metalnessRow = UI.get('metalnessRow', this.id);
	    var emissiveRow = UI.get('emissiveRow', this.id);
	    var specularRow = UI.get('specularRow', this.id);
	    var shininessRow = UI.get('shininessRow', this.id);
	    var clearCoatRow = UI.get('clearCoatRow', this.id);
	    var clearCoatRoughnessRow = UI.get('clearCoatRoughnessRow', this.id);
	    var vertexColorsRow = UI.get('vertexColorsRow', this.id);
	    var skinningRow = UI.get('skinningRow', this.id);
	    var mapRow = UI.get('mapRow', this.id);
	    var alphaMapRow = UI.get('alphaMapRow', this.id);
	    var bumpMapRow = UI.get('bumpMapRow', this.id);
	    var normalMapRow = UI.get('normalMapRow', this.id);
	    var displacementMapRow = UI.get('displacementMapRow', this.id);
	    var roughnessMapRow = UI.get('roughnessMapRow', this.id);
	    var metalnessMapRow = UI.get('metalnessMapRow', this.id);
	    var specularMapRow = UI.get('specularMapRow', this.id);
	    var envMapRow = UI.get('envMapRow', this.id);
	    var lightMapRow = UI.get('lightMapRow', this.id);
	    var aoMapRow = UI.get('aoMapRow', this.id);
	    var emissiveMapRow = UI.get('emissiveMapRow', this.id);
	    var sideRow = UI.get('sideRow', this.id);
	    var flatShadingRow = UI.get('flatShadingRow', this.id);
	    var blendingRow = UI.get('blendingRow', this.id);
	    var opacityRow = UI.get('opacityRow', this.id);
	    var transparentRow = UI.get('transparentRow', this.id);
	    var alphaTestRow = UI.get('alphaTestRow', this.id);
	    var wireframeRow = UI.get('wireframeRow', this.id);

	    var properties = {
	        'vertexShader': programRow,
	        'color': colorRow,
	        'roughness': roughnessRow,
	        'metalness': metalnessRow,
	        'emissive': emissiveRow,
	        'specular': specularRow,
	        'shininess': shininessRow,
	        'clearCoat': clearCoatRow,
	        'clearCoatRoughness': clearCoatRoughnessRow,
	        'vertexColors': vertexColorsRow,
	        'skinning': skinningRow,
	        'map': mapRow,
	        'alphaMap': alphaMapRow,
	        'bumpMap': bumpMapRow,
	        'normalMap': normalMapRow,
	        'displacementMap': displacementMapRow,
	        'roughnessMap': roughnessMapRow,
	        'metalnessMap': metalnessMapRow,
	        'specularMap': specularMapRow,
	        'envMap': envMapRow,
	        'lightMap': lightMapRow,
	        'aoMap': aoMapRow,
	        'emissiveMap': emissiveMapRow,
	        'side': sideRow,
	        'flatShading': flatShadingRow,
	        'blending': blendingRow,
	        'opacity': opacityRow,
	        'transparent': transparentRow,
	        'alphaTest': alphaTestRow,
	        'wireframe': wireframeRow
	    };

	    var material = this.selected.material;
	    for (var property in properties) {
	        properties[property].dom.style.display = material[property] === undefined ? 'none' : '';
	    }
	};

	MaterialComponent.prototype.setRowValue = function () {
	    var type = UI.get('type', this.id);
	    var color = UI.get('color', this.id);
	    var roughness = UI.get('roughness', this.id);
	    var metalness = UI.get('metalness', this.id);
	    var emissive = UI.get('emissive', this.id);
	    var specular = UI.get('specular', this.id);
	    var shininess = UI.get('shininess', this.id);
	    var clearCoat = UI.get('clearCoat', this.id);
	    var clearCoatRoughness = UI.get('clearCoatRoughness', this.id);
	    var vertexColors = UI.get('vertexColors', this.id);
	    var skinning = UI.get('skinning', this.id);
	    var mapEnabled = UI.get('mapEnabled', this.id);
	    var map = UI.get('map', this.id);
	    var alphaMapEnabled = UI.get('alphaMapEnabled', this.id);
	    var alphaMap = UI.get('alphaMap', this.id);
	    var bumpMapEnabled = UI.get('bumpMapEnabled', this.id);
	    var bumpMap = UI.get('bumpMap', this.id);
	    var bumpScale = UI.get('bumpScale', this.id);
	    var normalMapEnabled = UI.get('normalMapEnabled', this.id);
	    var normalMap = UI.get('normalMap', this.id);
	    var displacementMapEnabled = UI.get('displacementMapEnabled', this.id);
	    var displacementMap = UI.get('displacementMap', this.id);
	    var displacementScale = UI.get('displacementScale', this.id);
	    var roughnessMapEnabled = UI.get('roughnessMapEnabled', this.id);
	    var roughnessMap = UI.get('roughnessMap', this.id);
	    var metalnessMapEnabled = UI.get('metalnessMapEnabled', this.id);
	    var metalnessMap = UI.get('metalnessMap', this.id);
	    var specularMapEnabled = UI.get('specularMapEnabled', this.id);
	    var specularMap = UI.get('specularMap', this.id);
	    var envMapEnabled = UI.get('envMapEnabled', this.id);
	    var envMap = UI.get('envMap', this.id);
	    var reflectivity = UI.get('reflectivity', this.id);
	    var lightMapEnabled = UI.get('lightMapEnabled', this.id);
	    var lightMap = UI.get('lightMap', this.id);
	    var aoMapEnabled = UI.get('aoMapEnabled', this.id);
	    var aoMap = UI.get('aoMap', this.id);
	    var aoScale = UI.get('aoScale', this.id);
	    var emissiveMapEnabled = UI.get('emissiveMapEnabled', this.id);
	    var emissiveMap = UI.get('emissiveMap', this.id);
	    var side = UI.get('side', this.id);
	    var flatShading = UI.get('flatShading', this.id);
	    var blending = UI.get('blending', this.id);
	    var opacity = UI.get('opacity', this.id);
	    var transparent = UI.get('transparent', this.id);
	    var alphaTest = UI.get('alphaTest', this.id);
	    var wireframe = UI.get('wireframe', this.id);
	    var wireframeLinewidth = UI.get('wireframeLinewidth', this.id);

	    var material = this.selected.material;

	    type.setValue(material.type);

	    if (material.color !== undefined) {
	        color.setHexValue(material.color.getHexString());
	    }

	    if (material.roughness !== undefined) {
	        roughness.setValue(material.roughness);
	    }

	    if (material.metalness !== undefined) {
	        metalness.setValue(material.metalness);
	    }

	    if (material.emissive !== undefined) {
	        emissive.setHexValue(material.emissive.getHexString());
	    }

	    if (material.specular !== undefined) {
	        specular.setHexValue(material.specular.getHexString());
	    }

	    if (material.shininess !== undefined) {
	        shininess.setValue(material.shininess);
	    }

	    if (material.clearCoat !== undefined) {
	        clearCoat.setValue(material.clearCoat);
	    }

	    if (material.clearCoatRoughness !== undefined) {
	        clearCoatRoughness.setValue(material.clearCoatRoughness);
	    }

	    if (material.vertexColors !== undefined) {
	        vertexColors.setValue(material.vertexColors);
	    }

	    if (material.skinning !== undefined) {
	        skinning.setValue(material.skinning);
	    }

	    if (material.map) {
	        mapEnabled.setValue(material.map !== null);

	        if (material.map !== null) {
	            map.setValue(material.map);
	        }
	    }

	    if (material.alphaMap !== undefined) {
	        alphaMapEnabled.setValue(material.alphaMap !== null);

	        if (material.alphaMap !== null) {
	            alphaMap.setValue(material.alphaMap);
	        }
	    }

	    if (material.bumpMap !== undefined) {
	        bumpMapEnabled.setValue(material.bumpMap !== null);

	        if (material.bumpMap !== null) {
	            bumpMap.setValue(material.bumpMap);
	            bumpScale.setValue(material.bumpScale);
	        }
	    }

	    if (material.normalMap !== undefined) {
	        normalMapEnabled.setValue(material.normalMap !== null);

	        if (material.normalMap !== null) {
	            normalMap.setValue(material.normalMap);
	        }
	    }

	    if (material.displacementMap !== undefined) {
	        displacementMapEnabled.setValue(material.displacementMap !== null);

	        if (material.displacementMap !== null) {
	            displacementMap.setValue(material.displacementMap);
	            displacementScale.setValue(material.displacementScale);
	        }
	    }

	    if (material.roughnessMap !== undefined) {
	        roughnessMapEnabled.setValue(material.roughnessMap !== null);

	        if (material.roughnessMap !== null) {
	            roughnessMap.setValue(material.roughnessMap);
	        }
	    }

	    if (material.metalnessMap !== undefined) {
	        metalnessMapEnabled.setValue(material.metalnessMap !== null);

	        if (material.metalnessMap !== null) {
	            metalnessMap.setValue(material.metalnessMap);
	        }
	    }

	    if (material.specularMap !== undefined) {
	        specularMapEnabled.setValue(material.specularMap !== null);

	        if (material.specularMap !== null) {
	            specularMap.setValue(material.specularMap);
	        }
	    }

	    if (material.envMap !== undefined) {
	        envMapEnabled.setValue(material.envMap !== null);

	        if (material.envMap !== null) {
	            envMap.setValue(material.envMap);
	        }
	    }

	    if (material.reflectivity !== undefined) {
	        reflectivity.setValue(material.reflectivity);
	    }

	    if (material.lightMap !== undefined) {
	        lightMapEnabled.setValue(material.lightMap !== null);

	        if (material.lightMap !== null) {
	            lightMap.setValue(material.lightMap);
	        }
	    }

	    if (material.aoMap !== undefined) {
	        aoMapEnabled.setValue(material.aoMap !== null);

	        if (material.aoMap !== null) {
	            aoMap.setValue(material.aoMap);
	            aoScale.setValue(material.aoMapIntensity);
	        }
	    }

	    if (material.emissiveMap !== undefined) {
	        emissiveMapEnabled.setValue(material.emissiveMap !== null);

	        if (material.emissiveMap !== null) {
	            emissiveMap.setValue(material.emissiveMap);
	        }
	    }

	    if (material.side !== undefined) {
	        side.setValue(material.side);
	    }

	    if (material.flatShading !== undefined) {
	        flatShading.setValue(material.flatShading);
	    }

	    if (material.blending !== undefined) {
	        blending.setValue(material.blending);
	    }

	    if (material.opacity !== undefined) {
	        opacity.setValue(material.opacity);
	    }

	    if (material.transparent !== undefined) {
	        transparent.setValue(material.transparent);
	    }

	    if (material.alphaTest !== undefined) {
	        alphaTest.setValue(material.alphaTest);
	    }

	    if (material.wireframe !== undefined) {
	        wireframe.setValue(material.wireframe);
	    }

	    if (material.wireframeLinewidth !== undefined) {
	        wireframeLinewidth.setValue(material.wireframeLinewidth);
	    }
	};

	MaterialComponent.prototype.updateMaterial = function () {
	    var type = UI.get('type', this.id);
	    var color = UI.get('color', this.id);
	    var roughness = UI.get('roughness', this.id);
	    var metalness = UI.get('metalness', this.id);
	    var emissive = UI.get('emissive', this.id);
	    var specular = UI.get('specular', this.id);
	    var shininess = UI.get('shininess', this.id);
	    var clearCoat = UI.get('clearCoat', this.id);
	    var clearCoatRoughness = UI.get('clearCoatRoughness', this.id);
	    var vertexColors = UI.get('vertexColors', this.id);
	    var skinning = UI.get('skinning', this.id);
	    var mapEnabled = UI.get('mapEnabled', this.id);
	    var map = UI.get('map', this.id);
	    var alphaMapEnabled = UI.get('alphaMapEnabled', this.id);
	    var alphaMap = UI.get('alphaMap', this.id);
	    var bumpMapEnabled = UI.get('bumpMapEnabled', this.id);
	    var bumpMap = UI.get('bumpMap', this.id);
	    var bumpScale = UI.get('bumpScale', this.id);
	    var normalMapEnabled = UI.get('normalMapEnabled', this.id);
	    var normalMap = UI.get('normalMap', this.id);
	    var displacementMapEnabled = UI.get('displacementMapEnabled', this.id);
	    var displacementMap = UI.get('displacementMap', this.id);
	    var displacementScale = UI.get('displacementScale', this.id);
	    var roughnessMapEnabled = UI.get('roughnessMapEnabled', this.id);
	    var roughnessMap = UI.get('roughnessMap', this.id);
	    var metalnessMapEnabled = UI.get('metalnessMapEnabled', this.id);
	    var metalnessMap = UI.get('metalnessMap', this.id);
	    var specularMapEnabled = UI.get('specularMapEnabled', this.id);
	    var specularMap = UI.get('specularMap', this.id);
	    var envMapEnabled = UI.get('envMapEnabled', this.id);
	    var envMap = UI.get('envMap', this.id);
	    var reflectivity = UI.get('reflectivity', this.id);
	    var lightMapEnabled = UI.get('lightMapEnabled', this.id);
	    var lightMap = UI.get('lightMap', this.id);
	    var aoMapEnabled = UI.get('aoMapEnabled', this.id);
	    var aoMap = UI.get('aoMap', this.id);
	    var aoScale = UI.get('aoScale', this.id);
	    var emissiveMapEnabled = UI.get('emissiveMapEnabled', this.id);
	    var emissiveMap = UI.get('emissiveMap', this.id);
	    var side = UI.get('side', this.id);
	    var flatShading = UI.get('flatShading', this.id);
	    var blending = UI.get('blending', this.id);
	    var opacity = UI.get('opacity', this.id);
	    var transparent = UI.get('transparent', this.id);
	    var alphaTest = UI.get('alphaTest', this.id);
	    var wireframe = UI.get('wireframe', this.id);
	    var wireframeLinewidth = UI.get('wireframeLinewidth', this.id);

	    var editor = this.app.editor;
	    var object = this.selected;
	    var geometry = object.geometry;
	    var material = object.material;

	    var textureWarning = false;
	    var objectHasUvs = false;

	    if (object instanceof THREE.Sprite) {
	        objectHasUvs = true;
	    }

	    if (geometry instanceof THREE.Geometry && geometry.faceVertexUvs[0].length > 0) {
	        objectHasUvs = true;
	    }

	    if (geometry instanceof THREE.BufferGeometry && geometry.attributes.uv !== undefined) {
	        objectHasUvs = true;
	    }

	    if (material instanceof THREE[type.getValue()] === false) {
	        material = new THREE[type.getValue()]();

	        if (material instanceof THREE.ShaderMaterial) {
	            material.uniforms = {
	                time: {
	                    value: 1.0
	                }
	            };
	            material.vertexShader = ShaderMaterialVertex;
	            material.fragmentShader = ShaderMaterialFragment;
	        }

	        if (material instanceof THREE.RawShaderMaterial) {
	            material.uniforms = {
	                time: {
	                    value: 1.0
	                }
	            };
	            material.vertexShader = RawShaderMaterialVertex;
	            material.fragmentShader = RawShaderMaterialFragment;
	        }

	        editor.execute(new SetMaterialCommand(object, material), '新材质：' + type.getValue());
	    }

	    if (material.color !== undefined && material.color.getHex() !== color.getHexValue()) {
	        editor.execute(new SetMaterialColorCommand(object, 'color', color.getHexValue()));
	    }

	    if (material.roughness !== undefined && Math.abs(material.roughness - roughness.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'roughness', roughness.getValue()));
	    }

	    if (material.metalness !== undefined && Math.abs(material.metalness - metalness.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'metalness', metalness.getValue()));
	    }

	    if (material.emissive !== undefined && material.emissive.getHex() !== emissive.getHexValue()) {
	        editor.execute(new SetMaterialColorCommand(object, 'emissive', emissive.getHexValue()));
	    }

	    if (material.specular !== undefined && material.specular.getHex() !== specular.getHexValue()) {
	        editor.execute(new SetMaterialColorCommand(object, 'specular', specular.getHexValue()));
	    }

	    if (material.shininess !== undefined && Math.abs(material.shininess - shininess.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'shininess', shininess.getValue()));
	    }

	    if (material.clearCoat !== undefined && Math.abs(material.clearCoat - clearCoat.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'clearCoat', clearCoat.getValue()));
	    }

	    if (material.clearCoatRoughness !== undefined && Math.abs(material.clearCoatRoughness - clearCoatRoughness.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'clearCoatRoughness', clearCoatRoughness.getValue()));
	    }

	    if (material.vertexColors !== undefined) {
	        if (material.vertexColors !== parseInt(vertexColors.getValue())) {
	            editor.execute(new SetMaterialValueCommand(object, 'vertexColors', parseInt(vertexColors.getValue())));
	        }
	    }

	    if (material.skinning !== undefined && material.skinning !== skinning.getValue()) {
	        editor.execute(new SetMaterialValueCommand(object, 'skinning', skinning.getValue()));
	    }

	    if (material.map !== undefined) {
	        var mapEnabled = mapEnabled.getValue() === true;
	        if (objectHasUvs) {
	            var map = mapEnabled ? map.getValue() : null;
	            if (material.map !== map) {
	                editor.execute(new SetMaterialMapCommand(object, 'map', map));
	            }
	        } else {
	            if (mapEnabled) textureWarning = true;
	        }
	    }

	    if (material.alphaMap !== undefined) {
	        var mapEnabled = alphaMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var alphaMap = mapEnabled ? alphaMap.getValue() : null;

	            if (material.alphaMap !== alphaMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'alphaMap', alphaMap));
	            }
	        } else {
	            if (mapEnabled) textureWarning = true;
	        }
	    }

	    if (material.bumpMap !== undefined) {
	        var bumpMapEnabled = bumpMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var bumpMap = bumpMapEnabled ? bumpMap.getValue() : null;

	            if (material.bumpMap !== bumpMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'bumpMap', bumpMap));
	            }

	            if (material.bumpScale !== bumpScale.getValue()) {
	                editor.execute(new SetMaterialValueCommand(object, 'bumpScale', bumpScale.getValue()));
	            }
	        } else {
	            if (bumpMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.normalMap !== undefined) {
	        var normalMapEnabled = normalMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var normalMap = normalMapEnabled ? normalMap.getValue() : null;

	            if (material.normalMap !== normalMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'normalMap', normalMap));
	            }
	        } else {
	            if (normalMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.displacementMap !== undefined) {
	        var displacementMapEnabled = displacementMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var displacementMap = displacementMapEnabled ? displacementMap.getValue() : null;

	            if (material.displacementMap !== displacementMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'displacementMap', displacementMap));
	            }

	            if (material.displacementScale !== displacementScale.getValue()) {
	                editor.execute(new SetMaterialValueCommand(object, 'displacementScale', displacementScale.getValue()));
	            }
	        } else {
	            if (displacementMapEnabled) textureWarning = true;
	        }

	    }

	    if (material.roughnessMap !== undefined) {
	        var roughnessMapEnabled = roughnessMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var roughnessMap = roughnessMapEnabled ? roughnessMap.getValue() : null;

	            if (material.roughnessMap !== roughnessMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'roughnessMap', roughnessMap));
	            }
	        } else {
	            if (roughnessMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.metalnessMap !== undefined) {
	        var metalnessMapEnabled = metalnessMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var metalnessMap = metalnessMapEnabled ? metalnessMap.getValue() : null;

	            if (material.metalnessMap !== metalnessMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'metalnessMap', metalnessMap));
	            }
	        } else {
	            if (metalnessMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.specularMap !== undefined) {
	        var specularMapEnabled = specularMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var specularMap = specularMapEnabled ? specularMap.getValue() : null;

	            if (material.specularMap !== specularMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'specularMap', specularMap));
	            }
	        } else {
	            if (specularMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.envMap !== undefined) {
	        var envMapEnabled = envMapEnabled.getValue() === true;
	        var envMap = envMapEnabled ? envMap.getValue() : null;

	        if (material.envMap !== envMap) {
	            editor.execute(new SetMaterialMapCommand(object, 'envMap', envMap));
	        }
	    }

	    if (material.reflectivity !== undefined) {
	        var reflectivity = reflectivity.getValue();

	        if (material.reflectivity !== reflectivity) {
	            editor.execute(new SetMaterialValueCommand(object, 'reflectivity', reflectivity));
	        }
	    }

	    if (material.lightMap !== undefined) {
	        var lightMapEnabled = lightMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var lightMap = lightMapEnabled ? lightMap.getValue() : null;

	            if (material.lightMap !== lightMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'lightMap', lightMap));
	            }
	        } else {
	            if (lightMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.aoMap !== undefined) {
	        var aoMapEnabled = aoMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var aoMap = aoMapEnabled ? aoMap.getValue() : null;

	            if (material.aoMap !== aoMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'aoMap', aoMap));
	            }

	            if (material.aoMapIntensity !== aoScale.getValue()) {
	                editor.execute(new SetMaterialValueCommand(object, 'aoMapIntensity', aoScale.getValue()));
	            }
	        } else {
	            if (aoMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.emissiveMap !== undefined) {
	        var emissiveMapEnabled = emissiveMapEnabled.getValue() === true;

	        if (objectHasUvs) {
	            var emissiveMap = emissiveMapEnabled ? emissiveMap.getValue() : null;

	            if (material.emissiveMap !== emissiveMap) {
	                editor.execute(new SetMaterialMapCommand(object, 'emissiveMap', emissiveMap));
	            }
	        } else {
	            if (emissiveMapEnabled) textureWarning = true;
	        }
	    }

	    if (material.side !== undefined) {
	        var side = parseInt(side.getValue());

	        if (material.side !== side) {
	            editor.execute(new SetMaterialValueCommand(object, 'side', side));
	        }
	    }

	    if (material.flatShading !== undefined) {
	        var flatShading = flatShading.getValue();

	        if (material.flatShading != flatShading) {
	            editor.execute(new SetMaterialValueCommand(object, 'flatShading', flatShading));
	        }
	    }

	    if (material.blending !== undefined) {
	        var blending = parseInt(blending.getValue());

	        if (material.blending !== blending) {
	            editor.execute(new SetMaterialValueCommand(object, 'blending', blending));
	        }
	    }

	    if (material.opacity !== undefined && Math.abs(material.opacity - opacity.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'opacity', opacity.getValue()));
	    }

	    if (material.transparent !== undefined && material.transparent !== transparent.getValue()) {
	        editor.execute(new SetMaterialValueCommand(object, 'transparent', transparent.getValue()));
	    }

	    if (material.alphaTest !== undefined && Math.abs(material.alphaTest - alphaTest.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'alphaTest', alphaTest.getValue()));
	    }

	    if (material.wireframe !== undefined && material.wireframe !== wireframe.getValue()) {
	        editor.execute(new SetMaterialValueCommand(object, 'wireframe', wireframe.getValue()));
	    }

	    if (material.wireframeLinewidth !== undefined && Math.abs(material.wireframeLinewidth - wireframeLinewidth.getValue()) >= 0.01) {
	        editor.execute(new SetMaterialValueCommand(object, 'wireframeLinewidth', wireframeLinewidth.getValue()));
	    }

	    this.updateUI();

	    if (textureWarning) {
	        console.warn(`无法设置纹理，${this.selected.name}的材质没有纹理坐标！`);
	    }
	};

	MaterialComponent.prototype.editProgramInfo = function () {
	    var material = this.selected.material;

	    var obj = {
	        defines: material.defines,
	        uniforms: material.uniforms,
	        attributes: material.attributes
	    };

	    this.app.script.open(material.uuid, this.selected.name + '-ProgramInfo', 'json', JSON.stringify(obj), this.selected.name + '-着色器信息', source => {
	        try {
	            obj = JSON.parse(source);
	            material.defines = obj.defines;
	            material.uniforms = obj.uniforms;
	            material.attributes = obj.attributes;
	            material.needsUpdate = true;
	        } catch (e) {
	            this.app.error(this.selected.name + '-着色器信息 无法反序列化。');
	        }
	    });
	};

	MaterialComponent.prototype.editVertexShader = function () {
	    var material = this.selected.material;

	    this.app.script.open(material.uuid, this.selected.name + '-VertexShader', 'vertexShader', material.vertexShader, this.selected.name + '-顶点着色器', source => {
	        material.vertexShader = source;
	        material.needsUpdate = true;
	    });
	};

	MaterialComponent.prototype.editFragmentShader = function () {
	    var material = this.selected.material;

	    this.app.script.open(material.uuid, this.selected.name + '-FragmentShader', 'fragmentShader', material.fragmentShader, this.selected.name + '-片源着色器', source => {
	        material.fragmentShader = source;
	        material.needsUpdate = true;
	    });
	};

	MaterialComponent.prototype.onSetMap = function () {
	    if (this.mapSettingWindow === undefined) {
	        this.mapSettingWindow = new TextureSettingWindow({
	            app: this.app
	        });
	        this.mapSettingWindow.render();
	    }

	    if (!this.selected.material.map) {
	        UI.msg('请先为该物体选择纹理！');
	        return;
	    }

	    this.mapSettingWindow.setData(this.selected.material.map);
	    this.mapSettingWindow.show();
	};

	/**
	 * 基本信息组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function PhysicsWorldComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	PhysicsWorldComponent.prototype = Object.create(BaseComponent.prototype);
	PhysicsWorldComponent.prototype.constructor = PhysicsWorldComponent;

	PhysicsWorldComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'objectPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '物理环境'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '碰撞配置'
	            }, {
	                xtype: 'select',
	                id: 'configType',
	                scope: this.id,
	                options: {
	                    'btDefaultCollisionConfiguration': '默认碰撞配置', // 无法使用布料
	                    'btSoftBodyRigidBodyCollisionConfiguration': '软体刚体碰撞配置'
	                },
	                onChange: this.onChangeConfigType.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '重力常数'
	            }, {
	                xtype: 'number',
	                id: 'gravityConstantX',
	                scope: this.id,
	                onChange: this.onChangeGravityConstant.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'gravityConstantY',
	                scope: this.id,
	                onChange: this.onChangeGravityConstant.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'gravityConstantZ',
	                scope: this.id,
	                onChange: this.onChangeGravityConstant.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	PhysicsWorldComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	PhysicsWorldComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	PhysicsWorldComponent.prototype.updateUI = function () {
	    var container = UI.get('objectPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Scene) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = app.physics;

	    var configType = UI.get('configType', this.id);
	    var gravityConstantX = UI.get('gravityConstantX', this.id);
	    var gravityConstantY = UI.get('gravityConstantY', this.id);
	    var gravityConstantZ = UI.get('gravityConstantZ', this.id);

	    if (this.selected.collisionConfiguration instanceof Ammo.btSoftBodyRigidBodyCollisionConfiguration) {
	        configType.setValue('btSoftBodyRigidBodyCollisionConfiguration');
	    } else {
	        configType.setValue('btDefaultCollisionConfiguration');
	    }

	    var gravity = this.selected.world.getGravity();
	    gravityConstantX.setValue(gravity.x());
	    gravityConstantY.setValue(gravity.y());
	    gravityConstantZ.setValue(gravity.z());
	};

	PhysicsWorldComponent.prototype.onChangeConfigType = function () {
	    var configType = UI.get('configType', this.id);
	    if (configType === 'btSoftBodyRigidBodyCollisionConfiguration') {
	        this.selected.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	    } else {
	        this.selected.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	    }
	    this.selected.dispatcher = new Ammo.btCollisionDispatcher(this.selected.collisionConfiguration);
	    this.selected.world.dispatcher = this.selected.dispatcher;
	};

	PhysicsWorldComponent.prototype.onChangeGravityConstant = function () {
	    var gravityConstantX = UI.get('gravityConstantX', this.id);
	    var gravityConstantY = UI.get('gravityConstantY', this.id);
	    var gravityConstantZ = UI.get('gravityConstantZ', this.id);

	    var gravity = new Ammo.btVector3(gravityConstantX.getValue(), gravityConstantY.getValue(), gravityConstantZ.getValue());
	    this.selected.world.setGravity(gravity);
	    this.selected.world.getWorldInfo().set_m_gravity(gravity);
	};

	/**
	 * 音频监听器组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function AudioListenerComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	AudioListenerComponent.prototype = Object.create(BaseComponent.prototype);
	AudioListenerComponent.prototype.constructor = AudioListenerComponent;

	AudioListenerComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'audioListenerPanel',
	        scope: this.id,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '音频监听器'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '主音量'
	            }, {
	                xtype: 'number',
	                id: 'masterVolume',
	                scope: this.id,
	                range: [0, 1],
	                value: 1,
	                onChange: this.onChangeMasterVolume.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	AudioListenerComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	AudioListenerComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	AudioListenerComponent.prototype.updateUI = function () {
	    var container = UI.get('audioListenerPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.PerspectiveCamera && editor.selected.children.indexOf(editor.audioListener) > -1) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.audioListener;

	    var masterVolume = UI.get('masterVolume', this.id);

	    masterVolume.setValue(this.selected.getMasterVolume());
	};

	AudioListenerComponent.prototype.onChangeMasterVolume = function () {
	    var masterVolume = UI.get('masterVolume', this.id);

	    this.selected.setMasterVolume(masterVolume.getValue());
	};

	/**
	 * 粒子发射器组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ParticleEmitterComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;

	    this.isPlaying = false;
	}

	ParticleEmitterComponent.prototype = Object.create(BaseComponent.prototype);
	ParticleEmitterComponent.prototype.constructor = ParticleEmitterComponent;

	ParticleEmitterComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'particleEmitterPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'label',
	            style: {
	                width: '100%',
	                color: '#555',
	                fontWeight: 'bold'
	            },
	            text: '粒子发射器'
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '位置'
	            }, {
	                xtype: 'number',
	                id: 'positionX',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'positionY',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'positionZ',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '位置发散'
	            }, {
	                xtype: 'number',
	                id: 'positionSpreadX',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'positionSpreadY',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'positionSpreadZ',
	                scope: this.id,
	                onChange: this.onChangePosition.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '速度'
	            }, {
	                xtype: 'number',
	                id: 'velocityX',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'velocityY',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'velocityZ',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '速度发散'
	            }, {
	                xtype: 'number',
	                id: 'velocitySpreadX',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'velocitySpreadY',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'velocitySpreadZ',
	                scope: this.id,
	                onChange: this.onChangeVelocity.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '加速度'
	            }, {
	                xtype: 'number',
	                id: 'accelerationX',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'accelerationY',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'accelerationZ',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '加速度发散'
	            }, {
	                xtype: 'number',
	                id: 'accelerationSpreadX',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'accelerationSpreadY',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'accelerationSpreadZ',
	                scope: this.id,
	                onChange: this.onChangeAcceleration.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '颜色1'
	            }, {
	                xtype: 'color',
	                id: 'color1',
	                scope: this.id,
	                onChange: this.onChangeColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '颜色2'
	            }, {
	                xtype: 'color',
	                id: 'color2',
	                scope: this.id,
	                onChange: this.onChangeColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '颜色3'
	            }, {
	                xtype: 'color',
	                id: 'color3',
	                scope: this.id,
	                onChange: this.onChangeColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '颜色4'
	            }, {
	                xtype: 'color',
	                id: 'color4',
	                scope: this.id,
	                onChange: this.onChangeColor.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '尺寸'
	            }, {
	                xtype: 'number',
	                id: 'size',
	                scope: this.id,
	                onChange: this.onChangeSize.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '尺寸发散'
	            }, {
	                xtype: 'number',
	                id: 'sizeSpread',
	                scope: this.id,
	                onChange: this.onChangeSize.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '纹理'
	            }, {
	                xtype: 'texture',
	                id: 'texture',
	                scope: this.id,
	                onChange: this.onChangeTexture.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '粒子数量'
	            }, {
	                xtype: 'int',
	                range: [1, Infinity],
	                id: 'particleCount',
	                scope: this.id,
	                onChange: this.onChangeParticleCount.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '持续时长'
	            }, {
	                xtype: 'number',
	                id: 'maxAge',
	                scope: this.id,
	                onChange: this.onChangeMaxAge.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '持续时长发散'
	            }, {
	                xtype: 'number',
	                id: 'maxAgeSpread',
	                scope: this.id,
	                onChange: this.onChangeMaxAgeSpread.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label'
	            }, {
	                xtype: 'button',
	                id: 'btnPreview',
	                scope: this.id,
	                text: '预览',
	                onClick: this.onPreview.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	ParticleEmitterComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	ParticleEmitterComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	ParticleEmitterComponent.prototype.updateUI = function () {
	    var container = UI.get('particleEmitterPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected.userData.type === 'ParticleEmitter') {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var positionX = UI.get('positionX', this.id);
	    var positionY = UI.get('positionY', this.id);
	    var positionZ = UI.get('positionZ', this.id);

	    var positionSpreadX = UI.get('positionSpreadX', this.id);
	    var positionSpreadY = UI.get('positionSpreadY', this.id);
	    var positionSpreadZ = UI.get('positionSpreadZ', this.id);

	    var velocityX = UI.get('velocityX', this.id);
	    var velocityY = UI.get('velocityY', this.id);
	    var velocityZ = UI.get('velocityZ', this.id);

	    var velocitySpreadX = UI.get('velocitySpreadX', this.id);
	    var velocitySpreadY = UI.get('velocitySpreadY', this.id);
	    var velocitySpreadZ = UI.get('velocitySpreadZ', this.id);

	    var accelerationX = UI.get('accelerationX', this.id);
	    var accelerationY = UI.get('accelerationY', this.id);
	    var accelerationZ = UI.get('accelerationZ', this.id);

	    var accelerationSpreadX = UI.get('accelerationSpreadX', this.id);
	    var accelerationSpreadY = UI.get('accelerationSpreadY', this.id);
	    var accelerationSpreadZ = UI.get('accelerationSpreadZ', this.id);

	    var color1 = UI.get('color1', this.id);
	    var color2 = UI.get('color2', this.id);
	    var color3 = UI.get('color3', this.id);
	    var color4 = UI.get('color4', this.id);

	    var size = UI.get('size', this.id);
	    var sizeSpread = UI.get('sizeSpread', this.id);
	    var texture = UI.get('texture', this.id);
	    var particleCount = UI.get('particleCount', this.id);
	    var maxAge = UI.get('maxAge', this.id);
	    var maxAgeSpread = UI.get('maxAgeSpread', this.id);
	    var btnPreview = UI.get('btnPreview', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    positionX.setValue(emitter.position.value.x);
	    positionY.setValue(emitter.position.value.y);
	    positionZ.setValue(emitter.position.value.z);

	    positionSpreadX.setValue(emitter.position.spread.x);
	    positionSpreadY.setValue(emitter.position.spread.y);
	    positionSpreadZ.setValue(emitter.position.spread.z);

	    velocityX.setValue(emitter.velocity.value.x);
	    velocityY.setValue(emitter.velocity.value.y);
	    velocityZ.setValue(emitter.velocity.value.z);

	    velocitySpreadX.setValue(emitter.velocity.spread.x);
	    velocitySpreadY.setValue(emitter.velocity.spread.y);
	    velocitySpreadZ.setValue(emitter.velocity.spread.z);

	    accelerationX.setValue(emitter.acceleration.value.x);
	    accelerationY.setValue(emitter.acceleration.value.y);
	    accelerationZ.setValue(emitter.acceleration.value.z);

	    accelerationSpreadX.setValue(emitter.acceleration.spread.x);
	    accelerationSpreadY.setValue(emitter.acceleration.spread.y);
	    accelerationSpreadZ.setValue(emitter.acceleration.spread.z);

	    color1.setValue(`#${emitter.color.value[0].getHexString()}`);
	    color2.setValue(`#${emitter.color.value[1].getHexString()}`);
	    color3.setValue(`#${emitter.color.value[2].getHexString()}`);
	    color4.setValue(`#${emitter.color.value[3].getHexString()}`);

	    size.setValue(emitter.size.value[0]);
	    sizeSpread.setValue(emitter.size.spread[0]);
	    texture.setValue(group.texture);
	    particleCount.setValue(emitter.particleCount);
	    maxAge.setValue(emitter.maxAge.value);
	    maxAgeSpread.setValue(emitter.maxAge.spread);

	    if (this.isPlaying) {
	        btnPreview.setText('取消');
	    } else {
	        btnPreview.setText('预览');
	    }
	};

	ParticleEmitterComponent.prototype.onChangePosition = function () {
	    var positionX = UI.get('positionX', this.id);
	    var positionY = UI.get('positionY', this.id);
	    var positionZ = UI.get('positionZ', this.id);

	    var positionSpreadX = UI.get('positionSpreadX', this.id);
	    var positionSpreadY = UI.get('positionSpreadY', this.id);
	    var positionSpreadZ = UI.get('positionSpreadZ', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.position.value.x = positionX.getValue();
	    emitter.position.value.y = positionY.getValue();
	    emitter.position.value.z = positionZ.getValue();

	    emitter.position.spread.x = positionSpreadX.getValue();
	    emitter.position.spread.y = positionSpreadY.getValue();
	    emitter.position.spread.z = positionSpreadZ.getValue();

	    emitter.updateFlags.position = true;
	};

	ParticleEmitterComponent.prototype.onChangeVelocity = function () {
	    var velocityX = UI.get('velocityX', this.id);
	    var velocityY = UI.get('velocityY', this.id);
	    var velocityZ = UI.get('velocityZ', this.id);

	    var velocitySpreadX = UI.get('velocitySpreadX', this.id);
	    var velocitySpreadY = UI.get('velocitySpreadY', this.id);
	    var velocitySpreadZ = UI.get('velocitySpreadZ', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.velocity.value.x = velocityX.getValue();
	    emitter.velocity.value.y = velocityY.getValue();
	    emitter.velocity.value.z = velocityZ.getValue();

	    emitter.velocity.spread.x = velocitySpreadX.getValue();
	    emitter.velocity.spread.y = velocitySpreadY.getValue();
	    emitter.velocity.spread.z = velocitySpreadZ.getValue();

	    emitter.updateFlags.velocity = true;
	};

	ParticleEmitterComponent.prototype.onChangeAcceleration = function () {
	    var accelerationX = UI.get('accelerationX', this.id);
	    var accelerationY = UI.get('accelerationY', this.id);
	    var accelerationZ = UI.get('accelerationZ', this.id);

	    var accelerationSpreadX = UI.get('accelerationSpreadX', this.id);
	    var accelerationSpreadY = UI.get('accelerationSpreadY', this.id);
	    var accelerationSpreadZ = UI.get('accelerationSpreadZ', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.acceleration.value.x = accelerationX.getValue();
	    emitter.acceleration.value.y = accelerationY.getValue();
	    emitter.acceleration.value.z = accelerationZ.getValue();

	    emitter.acceleration.spread.x = accelerationSpreadX.getValue();
	    emitter.acceleration.spread.y = accelerationSpreadY.getValue();
	    emitter.acceleration.spread.z = accelerationSpreadZ.getValue();

	    emitter.updateFlags.acceleration = true;
	};

	ParticleEmitterComponent.prototype.onChangeColor = function () {
	    var color1 = UI.get('color1', this.id);
	    var color2 = UI.get('color2', this.id);
	    var color3 = UI.get('color3', this.id);
	    var color4 = UI.get('color4', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.color.value[0] = new THREE.Color(color1.getHexValue());
	    emitter.color.value[1] = new THREE.Color(color2.getHexValue());
	    emitter.color.value[2] = new THREE.Color(color3.getHexValue());
	    emitter.color.value[3] = new THREE.Color(color4.getHexValue());

	    emitter.updateFlags.color = true;
	};

	ParticleEmitterComponent.prototype.onChangeSize = function () {
	    var size = UI.get('size', this.id);
	    var sizeSpread = UI.get('sizeSpread', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    for (var i = 0; i < emitter.size.value.length; i++) {
	        emitter.size.value[i] = size.getValue();
	        emitter.size.spread[i] = sizeSpread.getValue();
	    }

	    emitter.updateFlags.size = true;
	};

	ParticleEmitterComponent.prototype.onChangeTexture = function () {
	    var texture = UI.get('texture', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    texture = texture.getValue();
	    texture.needsUpdate = true;

	    group.texture = texture;
	    group.material.uniforms.texture.value = texture;
	};

	ParticleEmitterComponent.prototype.onChangeParticleCount = function () {
	    var particleCount = UI.get('particleCount', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.particleCount = particleCount.getValue();

	    emitter.updateFlags.params = true;
	};

	ParticleEmitterComponent.prototype.onChangeMaxAge = function () {
	    var maxAge = UI.get('maxAge', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.maxAge.value = maxAge.getValue();

	    emitter.updateFlags.params = true;
	};

	ParticleEmitterComponent.prototype.onChangeMaxAgeSpread = function () {
	    var maxAgeSpread = UI.get('maxAgeSpread', this.id);

	    var group = this.selected.userData.group;
	    var emitter = group.emitters[0];

	    emitter.maxAge.spread = maxAgeSpread.getValue();

	    emitter.updateFlags.params = true;
	};

	ParticleEmitterComponent.prototype.onPreview = function () {
	    if (this.isPlaying) {
	        this.stopPreview();
	    } else {
	        this.startPreview();
	    }
	};

	ParticleEmitterComponent.prototype.startPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = true;
	    btnPreview.setText('取消');

	    this.app.on(`animate.${this.id}`, this.onAnimate.bind(this));
	};

	ParticleEmitterComponent.prototype.stopPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = false;
	    btnPreview.setText('预览');

	    var group = this.selected.userData.group;
	    var emitter = this.selected.userData.emitter;

	    group.removeEmitter(emitter);
	    group.addEmitter(emitter);
	    group.tick(0);

	    this.app.on(`animate.${this.id}`, null);
	};

	ParticleEmitterComponent.prototype.onAnimate = function (clock, deltaTime) {
	    var group = this.selected.userData.group;
	    group.tick(deltaTime);
	};

	/**
	 * canvas转DataURL
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} canvas 画布
	 * @param {*} type 图片类型 image/png或image/jpeg
	 * @param {*} quality jpeg图片质量
	 */
	function canvasToDataURL(canvas, type = 'image/png', quality = 0.8) {
	    if (type.toLowerCase() === 'image/png') {
	        return canvas.toDataURL(type);
	    } else {
	        return canvas.toDataURL(type, quality);
	    }
	}

	/**
	 * Blob转DataURL
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} blob Blob对象
	 */
	function blobToDataURL(blob) {
	    var reader = new FileReader();

	    return new Promise(resolve => {
	        reader.onload = e => {
	            resolve(e.target.result);
	        };
	        reader.readAsDataURL(blob);
	    });
	}

	/**
	 * 文件转DataURL
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} file 文件
	 */
	function fileToDataURL(file) {
	    return blobToDataURL(file);
	}

	/**
	 * DataURL转Blob
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} dataURL 
	 */
	function dataURLToBlob(dataURL) {
	    var array = dataURL.split(',');
	    var mimeType = array[0].match(/:(.*?);/)[1];
	    var binaryString = atob(array[1]);
	    var length = binaryString.length;
	    var uint8Array = new Uint8Array(length);
	    while (length--) {
	        uint8Array[length] = binaryString.charCodeAt(length);
	    }
	    return new Blob([uint8Array], { type: mimeType });
	}

	/**
	 * DataURL转File
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} dataURL 
	 * @param {*} filename 文件名
	 */
	function dataURLtoFile(dataURL, filename) {
	    var array = dataURL.split(',');
	    var mimeType = array[0].match(/:(.*?);/)[1];
	    var binaryString = atob(array[1]);
	    var length = binaryString.length;
	    var uint8Array = new Uint8Array(length);
	    while (length--) {
	        uint8Array[length] = binaryString.charCodeAt(length);
	    }
	    return new File([uint8Array], filename, { type: mimeType });
	}

	/**
	 * DataURL转图片
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} dataURL 
	 */
	function dataURLToImage(dataURL) {
	    var image = new Image();

	    return new Promise(resolve => {
	        image.onload = () => {
	            image.onload = null;
	            image.onerror = null;
	            resolve(image);
	        };
	        image.onerror = () => {
	            image.onload = null;
	            image.onerror = null;
	            resolve(null);
	        };
	        image.src = dataURL;
	    });
	}

	/**
	 * Blob转图片
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} blob 
	 */
	function BlobToImage(blob) {
	    return new Promise(resolve => {
	        blobToDataURL(blob).then(dataURL => {
	            dataURLToImage(dataURL).then(image => {
	                resolve(image);
	            });
	        });
	    });
	}

	/**
	 * 文件转图片
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} file 文件
	 */
	function FileToImage(file) {
	    return BlobToImage(file);
	}

	/**
	 * 图片转画布
	 * @author cuixiping / https://blog.csdn.net/cuixiping/article/details/45932793
	 * @param {*} image 图片
	 */
	function ImageToCanvas(image) {
	    var canvas = document.createElement('canvas');
	    canvas.width = image.width;
	    canvas.height = image.height;

	    var context = canvas.getContext('2d');
	    context.drawImage(image, 0, 0);

	    return canvas;
	}

	/**
	 * 画布转图片
	 * @param {*} canvas 画布
	 * @param {*} type 类型
	 * @param {*} quality jpeg图片质量
	 */
	function CanvasToImage(canvas, type = 'image/png', quality = 0.8) {
	    var image = new Image();
	    if (type === 'image/jpeg') {
	        image.src = canvas.toDataURL('image/jpeg', quality);
	    } else {
	        image.src = canvas.toDataURL('image/png');
	    }
	    return image;
	}

	/**
	 * 类型转换工具
	 * @author tengge / https://github.com/tengge1
	 */
	const Converter$1 = {
	    canvasToDataURL: canvasToDataURL,
	    blobToDataURL: blobToDataURL,
	    fileToDataURL: fileToDataURL,
	    dataURLToBlob: dataURLToBlob,
	    dataURLtoFile: dataURLtoFile,
	    dataURLToImage: dataURLToImage,
	    BlobToImage: BlobToImage,
	    FileToImage: FileToImage,
	    imageToCanvas: ImageToCanvas,
	    canvasToImage: CanvasToImage,
	};

	/**
	 * 场景组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SceneComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	SceneComponent.prototype = Object.create(BaseComponent.prototype);
	SceneComponent.prototype.constructor = SceneComponent;

	SceneComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'scenePanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '场景组件'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '背景'
	            }, {
	                xtype: 'select',
	                id: 'backgroundType',
	                scope: this.id,
	                options: {
	                    'Color': '纯色',
	                    'Image': '背景图片',
	                    'SkyBox': '立体贴图'
	                },
	                onChange: this.onChangeBackgroundType.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundColorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '背景颜色'
	            }, {
	                xtype: 'color',
	                id: 'backgroundColor',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundImageRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '背景图片'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundImage',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundPosXRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'x轴正向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundPosX',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundNegXRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'x轴负向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundNegX',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundPosYRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'y轴正向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundPosY',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundNegYRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'y轴负向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundNegY',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundPosZRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'z轴正向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundPosZ',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'backgroundNegZRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: 'z轴负向'
	            }, {
	                xtype: 'texture',
	                id: 'backgroundNegZ',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'cubeTextureCommandRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'button',
	                text: '获取',
	                onClick: this.onLoadCubeTexture.bind(this)
	            }, {
	                xtype: 'button',
	                text: '上传',
	                style: {
	                    marginLeft: '8px'
	                },
	                onClick: this.onSaveCubeTexture.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '雾'
	            }, {
	                xtype: 'select',
	                id: 'fogType',
	                scope: this.id,
	                options: {
	                    'None': '无',
	                    'Fog': '线性',
	                    'FogExp2': '指数型'
	                },
	                onChange: this.onChangeFogType.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'fogColorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '雾颜色'
	            }, {
	                xtype: 'color',
	                id: 'fogColor',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'fogNearRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '雾近点'
	            }, {
	                xtype: 'number',
	                id: 'fogNear',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'fogFarRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '雾远点'
	            }, {
	                xtype: 'number',
	                id: 'fogFar',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'fogDensityRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '雾浓度'
	            }, {
	                xtype: 'number',
	                id: 'fogDensity',
	                scope: this.id,
	                range: [0, 0.1],
	                precision: 3,
	                onChange: this.update.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	SceneComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	SceneComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	SceneComponent.prototype.updateUI = function () {
	    var container = UI.get('scenePanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Scene) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;
	    var scene = this.selected;

	    // 背景
	    var backgroundColorRow = UI.get('backgroundColorRow', this.id);
	    var backgroundImageRow = UI.get('backgroundImageRow', this.id);
	    var backgroundPosXRow = UI.get('backgroundPosXRow', this.id);
	    var backgroundNegXRow = UI.get('backgroundNegXRow', this.id);
	    var backgroundPosYRow = UI.get('backgroundPosYRow', this.id);
	    var backgroundNegYRow = UI.get('backgroundNegYRow', this.id);
	    var backgroundPosZRow = UI.get('backgroundPosZRow', this.id);
	    var backgroundNegZRow = UI.get('backgroundNegZRow', this.id);

	    var backgroundType = UI.get('backgroundType', this.id);
	    var backgroundColor = UI.get('backgroundColor', this.id);
	    var backgroundImage = UI.get('backgroundImage', this.id);
	    var backgroundPosX = UI.get('backgroundPosX', this.id);
	    var backgroundNegX = UI.get('backgroundNegX', this.id);
	    var backgroundPosY = UI.get('backgroundPosY', this.id);
	    var backgroundNegY = UI.get('backgroundNegY', this.id);
	    var backgroundPosZ = UI.get('backgroundPosZ', this.id);
	    var backgroundNegZ = UI.get('backgroundNegZ', this.id);

	    backgroundType.setValue(`${scene.background instanceof THREE.CubeTexture ? 'SkyBox' : (scene.background instanceof THREE.Texture ? 'Image' : 'Color')}`);

	    backgroundColorRow.dom.style.display = scene.background instanceof THREE.Color ? '' : 'none';
	    backgroundColor.setValue(`#${scene.background instanceof THREE.Color ? scene.background.getHexString() : 'aaaaaa'}`);

	    backgroundImageRow.dom.style.display = (scene.background instanceof THREE.Texture && !(scene.background instanceof THREE.CubeTexture)) ? '' : 'none';
	    backgroundImage.setValue((scene.background instanceof THREE.Texture && !(scene.background instanceof THREE.CubeTexture)) ? scene.background : null);

	    backgroundPosXRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';
	    backgroundNegXRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';
	    backgroundPosYRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';
	    backgroundNegYRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';
	    backgroundPosZRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';
	    backgroundNegZRow.dom.style.display = scene.background instanceof THREE.CubeTexture ? '' : 'none';

	    backgroundPosX.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[0]) : null);
	    backgroundNegX.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[1]) : null);
	    backgroundPosY.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[2]) : null);
	    backgroundNegY.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[3]) : null);
	    backgroundPosZ.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[4]) : null);
	    backgroundNegZ.setValue(scene.background instanceof THREE.CubeTexture ? new THREE.Texture(scene.background.image[5]) : null);

	    // 雾效
	    var fogColorRow = UI.get('fogColorRow', this.id);
	    var fogNearRow = UI.get('fogNearRow', this.id);
	    var fogFarRow = UI.get('fogFarRow', this.id);
	    var fogDensityRow = UI.get('fogDensityRow', this.id);

	    var fogType = UI.get('fogType', this.id);
	    var fogColor = UI.get('fogColor', this.id);
	    var fogNear = UI.get('fogNear', this.id);
	    var fogFar = UI.get('fogFar', this.id);
	    var fogDensity = UI.get('fogDensity', this.id);

	    fogType.setValue(scene.fog == null ? 'None' : ((scene.fog instanceof THREE.FogExp2) ? 'FogExp2' : 'Fog'));

	    fogColorRow.dom.style.display = scene.fog == null ? 'none' : '';
	    fogColor.setValue(`#${scene.fog == null ? 'aaaaaa' : scene.fog.color.getHexString()}`);

	    fogNearRow.dom.style.display = (scene.fog && scene.fog instanceof THREE.Fog) ? '' : 'none';
	    fogNear.setValue((scene.fog && scene.fog instanceof THREE.Fog) ? scene.fog.near : 0.1);

	    fogFarRow.dom.style.display = (scene.fog && scene.fog instanceof THREE.Fog) ? '' : 'none';
	    fogFar.setValue((scene.fog && scene.fog instanceof THREE.Fog) ? scene.fog.far : 50);

	    fogDensityRow.dom.style.display = (scene.fog && scene.fog instanceof THREE.FogExp2) ? '' : 'none';
	    fogDensity.setValue((scene.fog && scene.fog instanceof THREE.FogExp2) ? fog.density : 0.05);
	};

	SceneComponent.prototype.onChangeBackgroundType = function () { // 切换背景类型
	    var backgroundType = UI.get('backgroundType', this.id);

	    var backgroundColorRow = UI.get('backgroundColorRow', this.id);
	    var backgroundImageRow = UI.get('backgroundImageRow', this.id);
	    var backgroundPosXRow = UI.get('backgroundPosXRow', this.id);
	    var backgroundNegXRow = UI.get('backgroundNegXRow', this.id);
	    var backgroundPosYRow = UI.get('backgroundPosYRow', this.id);
	    var backgroundNegYRow = UI.get('backgroundNegYRow', this.id);
	    var backgroundPosZRow = UI.get('backgroundPosZRow', this.id);
	    var backgroundNegZRow = UI.get('backgroundNegZRow', this.id);

	    var cubeTextureCommandRow = UI.get('cubeTextureCommandRow', this.id);

	    switch (backgroundType.getValue()) {
	        case 'Color':
	            backgroundColorRow.dom.style.display = '';
	            backgroundImageRow.dom.style.display = 'none';
	            backgroundPosXRow.dom.style.display = 'none';
	            backgroundNegXRow.dom.style.display = 'none';
	            backgroundPosYRow.dom.style.display = 'none';
	            backgroundNegYRow.dom.style.display = 'none';
	            backgroundPosZRow.dom.style.display = 'none';
	            backgroundNegZRow.dom.style.display = 'none';
	            cubeTextureCommandRow.dom.style.display = 'none';
	            break;
	        case 'Image':
	            backgroundColorRow.dom.style.display = 'none';
	            backgroundImageRow.dom.style.display = '';
	            backgroundPosXRow.dom.style.display = 'none';
	            backgroundNegXRow.dom.style.display = 'none';
	            backgroundPosYRow.dom.style.display = 'none';
	            backgroundNegYRow.dom.style.display = 'none';
	            backgroundPosZRow.dom.style.display = 'none';
	            backgroundNegZRow.dom.style.display = 'none';
	            cubeTextureCommandRow.dom.style.display = 'none';
	            break;
	        case 'SkyBox':
	            backgroundColorRow.dom.style.display = 'none';
	            backgroundImageRow.dom.style.display = 'none';
	            backgroundPosXRow.dom.style.display = '';
	            backgroundNegXRow.dom.style.display = '';
	            backgroundPosYRow.dom.style.display = '';
	            backgroundNegYRow.dom.style.display = '';
	            backgroundPosZRow.dom.style.display = '';
	            backgroundNegZRow.dom.style.display = '';
	            cubeTextureCommandRow.dom.style.display = '';
	            break;
	    }

	    this.update();
	};

	SceneComponent.prototype.onLoadCubeTexture = function () { // 加载立体贴图
	    if (this.textureWindow === undefined) {
	        this.textureWindow = new TextureWindow({
	            app: this.app,
	            onSelect: this.onSelectCubeTexture.bind(this)
	        });
	        this.textureWindow.render();
	    }
	    this.textureWindow.show();
	};

	SceneComponent.prototype.onSelectCubeTexture = function (model) {
	    if (model.Type !== 'cube') {
	        UI.msg('只允许选择立体贴图！');
	        return;
	    }

	    var urls = model.Url.split(';');

	    var loader = new THREE.TextureLoader();

	    var promises = urls.map(url => {
	        return new Promise(resolve => {
	            loader.load(`${this.app.options.server}${url}`, texture => {
	                resolve(texture);
	            }, undefined, error => {
	                console.error(error);
	                UI.msg('立体贴图获取失败！');
	            });
	        });
	    });

	    Promise.all(promises).then(textures => {
	        UI.get('backgroundPosX', this.id).setValue(textures[0]);
	        UI.get('backgroundNegX', this.id).setValue(textures[1]);
	        UI.get('backgroundPosY', this.id).setValue(textures[2]);
	        UI.get('backgroundNegY', this.id).setValue(textures[3]);
	        UI.get('backgroundPosZ', this.id).setValue(textures[4]);
	        UI.get('backgroundNegZ', this.id).setValue(textures[5]);

	        this.textureWindow.hide();
	        this.update();
	    });
	};

	SceneComponent.prototype.onSaveCubeTexture = function () { // 保存立体贴图
	    var texturePosX = UI.get('backgroundPosX', this.id).getValue();
	    var textureNegX = UI.get('backgroundNegX', this.id).getValue();
	    var texturePosY = UI.get('backgroundPosY', this.id).getValue();
	    var textureNegY = UI.get('backgroundNegY', this.id).getValue();
	    var texturePosZ = UI.get('backgroundPosZ', this.id).getValue();
	    var textureNegZ = UI.get('backgroundNegZ', this.id).getValue();

	    if (!texturePosX || !textureNegX || !texturePosY || !textureNegY || !texturePosZ || !textureNegZ) {
	        UI.msg(`请上传所有立体贴图后再点击保存！`);
	        return;
	    }

	    var posXSrc = texturePosX.image.src;
	    var negXSrc = textureNegX.image.src;
	    var posYSrc = texturePosY.image.src;
	    var negYSrc = textureNegY.image.src;
	    var posZSrc = texturePosZ.image.src;
	    var negZSrc = textureNegZ.image.src;

	    if (posXSrc.startsWith('http') || negXSrc.startsWith('http') || posYSrc.startsWith('http') || negYSrc.startsWith('http') || posZSrc.startsWith('http') || negZSrc.startsWith('http')) {
	        UI.msg(`立体贴图已经存在于服务端，无需重复上传。`);
	        return;
	    }

	    // TODO: 下面代码转换出的DataURL太大，不行！！！

	    // 如果src是服务端地址，则需要转成DataURL
	    // if (posXSrc.startsWith('http')) {
	    //     posXSrc = Converter.canvasToDataURL(Converter.imageToCanvas(texturePosX.image));
	    // }

	    // if (negXSrc.startsWith('http')) {
	    //     negXSrc = Converter.canvasToDataURL(Converter.imageToCanvas(textureNegX.image));
	    // }

	    // if (posYSrc.startsWith('http')) {
	    //     posYSrc = Converter.canvasToDataURL(Converter.imageToCanvas(texturePosY.image));
	    // }

	    // if (negYSrc.startsWith('http')) {
	    //     negYSrc = Converter.canvasToDataURL(Converter.imageToCanvas(textureNegY.image));
	    // }

	    // if (posZSrc.startsWith('http')) {
	    //     posZSrc = Converter.canvasToDataURL(Converter.imageToCanvas(texturePosZ.image));
	    // }

	    // if (negZSrc.startsWith('http')) {
	    //     negZSrc = Converter.canvasToDataURL(Converter.imageToCanvas(textureNegZ.image));
	    // }

	    var promises = [
	        Converter$1.dataURLtoFile(posXSrc, 'posX'),
	        Converter$1.dataURLtoFile(negXSrc, 'negX'),
	        Converter$1.dataURLtoFile(posYSrc, 'posY'),
	        Converter$1.dataURLtoFile(negYSrc, 'negY'),
	        Converter$1.dataURLtoFile(posZSrc, 'posZ'),
	        Converter$1.dataURLtoFile(negZSrc, 'negZ'),
	    ];

	    Promise.all(promises).then(files => {
	        Ajax.post(`${this.app.options.server}/api/Texture/Add`, {
	            posX: files[0],
	            negX: files[1],
	            posY: files[2],
	            negY: files[3],
	            posZ: files[4],
	            negZ: files[5],
	        }, result => {
	            var obj = JSON.parse(result);
	            UI.msg(obj.Msg);
	        });
	    });
	};

	SceneComponent.prototype.onChangeFogType = function () { // 切换雾类型
	    var fogType = UI.get('fogType', this.id);
	    var fogColorRow = UI.get('fogColorRow', this.id);
	    var fogNearRow = UI.get('fogNearRow', this.id);
	    var fogFarRow = UI.get('fogFarRow', this.id);
	    var fogDensityRow = UI.get('fogDensityRow', this.id);

	    switch (fogType.getValue()) {
	        case 'None':
	            fogColorRow.dom.style.display = 'none';
	            fogNearRow.dom.style.display = 'none';
	            fogFarRow.dom.style.display = 'none';
	            fogDensityRow.dom.style.display = 'none';
	            break;
	        case 'Fog':
	            fogColorRow.dom.style.display = '';
	            fogNearRow.dom.style.display = '';
	            fogFarRow.dom.style.display = '';
	            fogDensityRow.dom.style.display = 'none';
	            break;
	        case 'FogExp2':
	            fogColorRow.dom.style.display = '';
	            fogNearRow.dom.style.display = 'none';
	            fogFarRow.dom.style.display = 'none';
	            fogDensityRow.dom.style.display = '';
	            break;
	    }

	    this.update();
	};

	SceneComponent.prototype.update = function () {
	    var scene = this.selected;

	    // 背景
	    var backgroundType = UI.get('backgroundType', this.id).getValue();
	    var backgroundColor = UI.get('backgroundColor', this.id).getHexValue();
	    var backgroundImage = UI.get('backgroundImage', this.id).getValue();
	    var backgroundPosX = UI.get('backgroundPosX', this.id).getValue();
	    var backgroundNegX = UI.get('backgroundNegX', this.id).getValue();
	    var backgroundPosY = UI.get('backgroundPosY', this.id).getValue();
	    var backgroundNegY = UI.get('backgroundNegY', this.id).getValue();
	    var backgroundPosZ = UI.get('backgroundPosZ', this.id).getValue();
	    var backgroundNegZ = UI.get('backgroundNegZ', this.id).getValue();

	    switch (backgroundType) {
	        case 'Color':
	            scene.background = new THREE.Color(backgroundColor);
	            break;
	        case 'Image':
	            if (backgroundImage) {
	                scene.background = backgroundImage;
	            }
	            break;
	        case 'SkyBox':
	            if (backgroundPosX && backgroundNegX && backgroundPosY && backgroundNegY && backgroundPosZ && backgroundNegZ) {
	                scene.background = new THREE.CubeTexture([
	                    backgroundPosX.image,
	                    backgroundNegX.image,
	                    backgroundPosY.image,
	                    backgroundNegY.image,
	                    backgroundPosZ.image,
	                    backgroundNegZ.image
	                ]);
	                scene.background.needsUpdate = true;
	            }
	            break;
	    }

	    // 雾
	    var fogType = UI.get('fogType', this.id).getValue();
	    var fogColor = UI.get('fogColor', this.id).getHexValue();
	    var fogNear = UI.get('fogNear', this.id).getValue();
	    var fogFar = UI.get('fogFar', this.id).getValue();
	    var fogDensity = UI.get('fogDensity', this.id).getValue();

	    switch (fogType) {
	        case 'None':
	            scene.fog = null;
	            break;
	        case 'Fog':
	            scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
	            break;
	        case 'FogExp2':
	            scene.fog = new THREE.FogExp2(fogColor, fogDensity);
	            break;
	    }
	};

	/**
	 * 背景音乐组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function BackgroundMusicComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	BackgroundMusicComponent.prototype = Object.create(BaseComponent.prototype);
	BackgroundMusicComponent.prototype.constructor = BackgroundMusicComponent;

	BackgroundMusicComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'backgroundMusicPanel',
	        scope: this.id,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '背景音乐'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '音频'
	            }, {
	                xtype: 'text',
	                id: 'name',
	                scope: this.id,
	                text: '(无)',
	                style: {
	                    width: '80px',
	                    border: '1px solid #ddd',
	                    marginRight: '8px'
	                }
	            }, {
	                xtype: 'button',
	                text: '选择',
	                onClick: this.onSelect.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '自动播放'
	            }, {
	                xtype: 'checkbox',
	                id: 'autoplay',
	                scope: this.id,
	                value: false,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '循环播放'
	            }, {
	                xtype: 'checkbox',
	                id: 'loop',
	                scope: this.id,
	                value: true,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '音量'
	            }, {
	                xtype: 'number',
	                id: 'volumn',
	                scope: this.id,
	                range: [0, 1],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label'
	            }, {
	                xtype: 'button',
	                id: 'btnPlay',
	                scope: this.id,
	                text: '播放',
	                style: {
	                    display: 'none'
	                },
	                onClick: this.onPlay.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	BackgroundMusicComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	BackgroundMusicComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	BackgroundMusicComponent.prototype.updateUI = function () {
	    var container = UI.get('backgroundMusicPanel', this.id);

	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Audio) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var name = UI.get('name', this.id);
	    var autoplay = UI.get('autoplay', this.id);
	    var loop = UI.get('loop', this.id);
	    var volumn = UI.get('volumn', this.id);
	    var btnPlay = UI.get('btnPlay', this.id);

	    name.setValue(this.selected.userData.Name);
	    autoplay.setValue(this.selected.userData.autoplay);
	    loop.setValue(this.selected.getLoop());
	    volumn.setValue(this.selected.getVolume());

	    if (this.selected.buffer) {
	        btnPlay.dom.style.display = '';
	        if (this.selected.isPlaying) {
	            btnPlay.setText('停止');
	        } else {
	            btnPlay.setText('播放');
	        }
	    } else {
	        btnPlay.dom.style.display = 'none';
	    }
	};

	BackgroundMusicComponent.prototype.onSelect = function () {
	    if (this.window === undefined) {
	        this.window = new AudioWindow({
	            app: this.app,
	            onSelect: this.onChange.bind(this)
	        });
	        this.window.render();
	    }
	    this.window.show();
	};

	BackgroundMusicComponent.prototype.onChange = function (obj) {
	    var name = UI.get('name', this.id);
	    var autoplay = UI.get('autoplay', this.id);
	    var loop = UI.get('loop', this.id);
	    var volumn = UI.get('volumn', this.id);
	    var btnPlay = UI.get('btnPlay', this.id);

	    if (obj) { // 仅选择窗口会传递obj参数
	        Object.assign(this.selected.userData, obj);
	        var loader = new THREE.AudioLoader();
	        loader.load(obj.Url, buffer => {
	            this.selected.setBuffer(buffer);
	            btnPlay.dom.style.display = '';
	        });
	    }

	    this.selected.userData.autoplay = autoplay.getValue(); // 这里不能给this.selected赋值，否则音频会自动播放
	    this.selected.setLoop(loop.getValue());
	    this.selected.setVolume(volumn.getValue());
	    this.updateUI();

	    if (this.window) {
	        this.window.hide();
	    }
	};

	BackgroundMusicComponent.prototype.onPlay = function () {
	    var btnPlay = UI.get('btnPlay', this.id);

	    if (this.selected.buffer) {
	        btnPlay.dom.style.display = '';
	        if (this.selected.isPlaying) {
	            this.selected.stop();
	            btnPlay.setText('播放');
	        } else {
	            this.selected.play();
	            btnPlay.setText('停止');
	        }
	    } else {
	        btnPlay.dom.style.display = 'none';
	    }
	};

	/**
	 * 火焰组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function FireComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;

	    this.isPlaying = false;
	}

	FireComponent.prototype = Object.create(BaseComponent.prototype);
	FireComponent.prototype.constructor = FireComponent;

	FireComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'firePanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'label',
	            style: {
	                width: '100%',
	                color: '#555',
	                fontWeight: 'bold'
	            },
	            text: '火焰组件'
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '宽度'
	            }, {
	                xtype: 'int',
	                id: 'width',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '高度'
	            }, {
	                xtype: 'int',
	                id: 'height',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '深度'
	            }, {
	                xtype: 'int',
	                id: 'depth',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '切片厚度'
	            }, {
	                xtype: 'number',
	                id: 'sliceSpacing',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label'
	            }, {
	                xtype: 'button',
	                id: 'btnPreview',
	                scope: this.id,
	                text: '预览',
	                onClick: this.onPreview.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	FireComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	FireComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	FireComponent.prototype.updateUI = function () {
	    var container = UI.get('firePanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected.userData.type === 'Fire') {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var depth = UI.get('depth', this.id);
	    var sliceSpacing = UI.get('sliceSpacing', this.id);
	    var btnPreview = UI.get('btnPreview', this.id);

	    var fire = this.selected.userData.fire;
	    width.setValue(fire.mesh.userData.width);
	    height.setValue(fire.mesh.userData.height);
	    depth.setValue(fire.mesh.userData.depth);
	    sliceSpacing.setValue(fire.mesh.userData.sliceSpacing);

	    if (this.isPlaying) {
	        btnPreview.setText('取消');
	    } else {
	        btnPreview.setText('预览');
	    }
	};

	FireComponent.prototype.onChange = function () {
	    var width = UI.get('width', this.id);
	    var height = UI.get('height', this.id);
	    var depth = UI.get('depth', this.id);
	    var sliceSpacing = UI.get('sliceSpacing', this.id);

	    VolumetricFire.texturePath = 'assets/textures/VolumetricFire/';

	    var editor = this.app.editor;

	    var fire = new VolumetricFire(
	        width.getValue(),
	        height.getValue(),
	        depth.getValue(),
	        sliceSpacing.getValue(),
	        editor.camera
	    );

	    fire.mesh.name = this.selected.name;
	    fire.mesh.position.copy(this.selected.position);
	    fire.mesh.rotation.copy(this.selected.rotation);
	    fire.mesh.scale.copy(this.selected.scale);

	    fire.mesh.userData.type = 'Fire';
	    fire.mesh.userData.fire = fire;
	    fire.mesh.userData.width = width.getValue();
	    fire.mesh.userData.height = height.getValue();
	    fire.mesh.userData.depth = depth.getValue();
	    fire.mesh.userData.sliceSpacing = sliceSpacing.getValue();

	    var index = editor.scene.children.indexOf(this.selected);
	    if (index > -1) {
	        editor.scene.children[index] = fire.mesh;
	        fire.mesh.parent = this.selected.parent;
	        this.selected.parent = null;
	        this.app.call(`objectRemoved`, this, this.selected);
	        this.app.call(`objectAdded`, this, fire.mesh);
	        editor.select(fire.mesh);
	        this.app.call('sceneGraphChanged', this.id);

	        fire.update(0);
	    }
	};

	FireComponent.prototype.onPreview = function () {
	    if (this.isPlaying) {
	        this.stopPreview();
	    } else {
	        this.startPreview();
	    }
	};

	FireComponent.prototype.startPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = true;
	    btnPreview.setText('取消');

	    this.app.on(`animate.${this.id}`, this.onAnimate.bind(this));
	};

	FireComponent.prototype.stopPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = false;
	    btnPreview.setText('预览');

	    this.app.on(`animate.${this.id}`, null);
	};

	FireComponent.prototype.onAnimate = function (clock, deltaTime) {
	    var elapsed = clock.getElapsedTime();

	    var fire = this.selected.userData.fire;
	    fire.update(elapsed);
	};

	/**
	 * 烟组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SmokeComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;

	    this.isPlaying = false;
	}

	SmokeComponent.prototype = Object.create(BaseComponent.prototype);
	SmokeComponent.prototype.constructor = SmokeComponent;

	SmokeComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'smokePanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'label',
	            style: {
	                width: '100%',
	                color: '#555',
	                fontWeight: 'bold'
	            },
	            text: '烟组件'
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label'
	            }, {
	                xtype: 'button',
	                id: 'btnPreview',
	                scope: this.id,
	                text: '预览',
	                onClick: this.onPreview.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	SmokeComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	SmokeComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	SmokeComponent.prototype.updateUI = function () {
	    var container = UI.get('smokePanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected.userData.type === 'Smoke') {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var btnPreview = UI.get('btnPreview', this.id);

	    if (this.isPlaying) {
	        btnPreview.setText('取消');
	    } else {
	        btnPreview.setText('预览');
	    }
	};

	SmokeComponent.prototype.onPreview = function () {
	    if (this.isPlaying) {
	        this.stopPreview();
	    } else {
	        this.startPreview();
	    }
	};

	SmokeComponent.prototype.startPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = true;
	    btnPreview.setText('取消');

	    this.app.on(`animate.${this.id}`, this.onAnimate.bind(this));
	};

	SmokeComponent.prototype.stopPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = false;
	    btnPreview.setText('预览');

	    this.app.on(`animate.${this.id}`, null);
	};

	SmokeComponent.prototype.onAnimate = function (clock, deltaTime) {
	    var elapsed = clock.getElapsedTime();
	    this.selected.update(elapsed);
	};

	/**
	 * 反光组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ReflectorComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	ReflectorComponent.prototype = Object.create(BaseComponent.prototype);
	ReflectorComponent.prototype.constructor = ReflectorComponent;

	ReflectorComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'reflectorPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '反光组件'
	            }]
	        }, {
	            xtype: 'row',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '反光'
	            }, {
	                xtype: 'checkbox',
	                id: 'reflect',
	                scope: this.id,
	                onChange: this.onChangeReflect.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'colorRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '颜色'
	            }, {
	                xtype: 'color',
	                id: 'color',
	                scope: this.id,
	                value: 0xffffff,
	                onChange: this.onChangeReflect.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'sizeRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '贴图尺寸'
	            }, {
	                xtype: 'select',
	                id: 'size',
	                scope: this.id,
	                options: {
	                    512: '512*512',
	                    1024: '1024*1024',
	                    2048: '2048*2048'
	                },
	                value: '1024',
	                onChange: this.onChangeReflect.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'clipBiasRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '裁剪偏移'
	            }, {
	                xtype: 'number',
	                id: 'clipBias',
	                scope: this.id,
	                value: 0,
	                onChange: this.onChangeReflect.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'recursionRow',
	            scope: this.id,
	            children: [{
	                xtype: 'label',
	                text: '递归'
	            }, {
	                xtype: 'checkbox',
	                id: 'recursion',
	                scope: this.id,
	                value: false,
	                onChange: this.onChangeReflect.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	ReflectorComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	ReflectorComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	ReflectorComponent.prototype.updateUI = function () {
	    var container = UI.get('reflectorPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var colorRow = UI.get('colorRow', this.id);
	    var sizeRow = UI.get('sizeRow', this.id);
	    var clipBiasRow = UI.get('clipBiasRow', this.id);
	    var recursionRow = UI.get('recursionRow', this.id);

	    var reflect = UI.get('reflect', this.id);
	    var color = UI.get('color', this.id);
	    var size = UI.get('size', this.id);
	    var clipBias = UI.get('clipBias', this.id);
	    var recursion = UI.get('recursion', this.id);

	    reflect.setValue(this.selected instanceof THREE.Reflector);

	    if (this.selected instanceof THREE.Reflector) {
	        colorRow.dom.style.display = '';
	        sizeRow.dom.style.display = '';
	        clipBiasRow.dom.style.display = '';
	        recursionRow.dom.style.display = '';
	        color.setHexValue(this.selected.userData.color);
	        size.setValue(this.selected.userData.size);
	        clipBias.setValue(this.selected.userData.clipBias);
	        recursion.setValue(this.selected.userData.recursion);
	    } else {
	        colorRow.dom.style.display = 'none';
	        sizeRow.dom.style.display = 'none';
	        clipBiasRow.dom.style.display = 'none';
	        recursionRow.dom.style.display = 'none';
	    }
	};

	ReflectorComponent.prototype.onChangeReflect = function () {
	    var reflect = UI.get('reflect', this.id);
	    var color = UI.get('color', this.id);
	    var size = UI.get('size', this.id);
	    var clipBias = UI.get('clipBias', this.id);
	    var recursion = UI.get('recursion', this.id);

	    var editor = this.app.editor;

	    if (reflect.getValue()) {
	        color = color.getHexValue();

	        if (!(this.selected instanceof THREE.Reflector) && !Array.isArray(this.selected.material) && this.selected.material.color) {
	            color = this.selected.material.color.getHex();
	        }

	        var reflector = new THREE.Reflector(this.selected.geometry, {
	            color: color,
	            textureWidth: parseInt(size.getValue()),
	            textureHeight: parseInt(size.getValue()),
	            clipBias: clipBias.getValue(),
	            recursion: recursion.getValue() ? 1 : 0
	        });

	        reflector.name = this.selected.name;
	        reflector.position.copy(this.selected.position);
	        reflector.rotation.copy(this.selected.rotation);
	        reflector.scale.copy(this.selected.scale);
	        reflector.castShadow = this.selected.castShadow;
	        reflector.receiveShadow = this.selected.receiveShadow;

	        if (this.selected instanceof THREE.Reflector) {
	            Object.assign(reflector.userData, this.selected.userData);
	        } else {
	            Object.assign(reflector.userData, this.selected.userData, {
	                mesh: this.selected
	            });
	        }

	        reflector.userData.color = color;
	        reflector.userData.size = size.getValue();
	        reflector.userData.clipBias = clipBias.getValue();
	        reflector.userData.recursion = recursion.getValue();

	        var index = editor.scene.children.indexOf(this.selected);
	        if (index > -1) {
	            editor.scene.children[index] = reflector;
	            reflector.parent = this.selected.parent;
	            this.selected.parent = null;
	            this.app.call(`objectRemoved`, this, this.selected);
	            this.app.call(`objectAdded`, this, reflector);
	            editor.select(reflector);
	            this.app.call('sceneGraphChanged', this.id);
	        }
	    } else {
	        if (this.selected instanceof THREE.Reflector) {
	            var mesh = this.selected.userData.mesh;
	            this.selected.userData.mesh = null;

	            mesh.name = this.selected.name;
	            mesh.position.copy(this.selected.position);
	            mesh.rotation.copy(this.selected.rotation);
	            mesh.scale.copy(this.selected.scale);
	            mesh.castShadow = this.selected.castShadow;
	            mesh.receiveShadow = this.selected.receiveShadow;

	            if (!Array.isArray(mesh.material) && mesh.material.color) {
	                mesh.material.color = new THREE.Color(color.getHexValue());
	            }

	            Object.assign(mesh.userData, this.selected.userData);

	            var index = editor.scene.children.indexOf(this.selected);
	            if (index > -1) {
	                editor.scene.children[index] = mesh;
	                mesh.parent = this.selected.parent;
	                this.selected.parent = null;
	                this.app.call(`objectRemoved`, this, this.selected);
	                this.app.call(`objectAdded`, this, mesh);
	                editor.select(mesh);
	                this.app.call('sceneGraphChanged', this.id);
	            }
	        }
	    }
	};

	/**
	 * LMesh组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function LMeshComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;

	    this.isPlaying = false;
	}

	LMeshComponent.prototype = Object.create(BaseComponent.prototype);
	LMeshComponent.prototype.constructor = LMeshComponent;

	LMeshComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'lmeshPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: 'LMesh组件'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '动画'
	            }, {
	                xtype: 'select',
	                id: 'anims',
	                scope: this.id,
	                onChange: this.onSelectAnim.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label'
	            }, {
	                xtype: 'button',
	                id: 'btnPreview',
	                scope: this.id,
	                text: '预览',
	                onClick: this.onPreview.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	LMeshComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	LMeshComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	LMeshComponent.prototype.updateUI = function () {
	    var container = UI.get('lmeshPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected.userData.type === 'lol') {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var anims = UI.get('anims', this.id);
	    var btnPreview = UI.get('btnPreview', this.id);

	    var model = this.selected.userData.model;
	    var animNames = model.getAnimations();

	    var options = {

	    };

	    animNames.forEach(n => {
	        options[n] = n;
	    });

	    anims.setOptions(options);
	    anims.setValue(animNames[0]);

	    if (this.isPlaying) {
	        btnPreview.setText('取消');
	    } else {
	        btnPreview.setText('预览');
	    }
	};

	LMeshComponent.prototype.onSelectAnim = function () {
	    var anims = UI.get('anims', this.id);

	    var model = this.selected.userData.model;
	    model.setAnimation(anims.getValue());
	};

	LMeshComponent.prototype.onPreview = function () {
	    if (this.isPlaying) {
	        this.stopPreview();
	    } else {
	        this.startPreview();
	    }
	};

	LMeshComponent.prototype.startPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = true;
	    btnPreview.setText('取消');

	    this.onSelectAnim();

	    this.app.on(`animate.${this.id}`, this.onAnimate.bind(this));
	};

	LMeshComponent.prototype.stopPreview = function () {
	    var btnPreview = UI.get('btnPreview', this.id);

	    this.isPlaying = false;
	    btnPreview.setText('预览');

	    this.app.on(`animate.${this.id}`, null);
	};

	LMeshComponent.prototype.onAnimate = function (clock, deltaTime) {
	    var model = this.selected.userData.model;
	    model.update(clock.getElapsedTime() * 1000);
	};

	/**
	 * MMD模型组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function MMDComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	MMDComponent.prototype = Object.create(BaseComponent.prototype);
	MMDComponent.prototype.constructor = MMDComponent;

	MMDComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'mmdPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: 'MMD模型'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '模型动画'
	            }, {
	                xtype: 'input',
	                id: 'animation',
	                scope: this.id,
	                disabled: true,
	                style: {
	                    width: '80px',
	                    fontSize: '12px'
	                }
	            }, {
	                xtype: 'button',
	                text: '选择',
	                onClick: this.selectAnimation.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	MMDComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	MMDComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	MMDComponent.prototype.updateUI = function () {
	    var container = UI.get('mmdPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && (editor.selected.userData.Type === 'pmd' || editor.selected.userData.Type === 'pmx')) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var animation = UI.get('animation', this.id);

	    if (this.selected.userData.Animation) {
	        animation.setValue(this.selected.userData.Animation.Name);
	    }
	};

	MMDComponent.prototype.selectAnimation = function () {
	    if (this.mmdWindow === undefined) {
	        this.mmdWindow = new MMDWindow({
	            app: this.app,
	            onSelect: this.onSelectAnimation.bind(this)
	        });
	        this.mmdWindow.render();
	    }
	    this.mmdWindow.show();
	};

	MMDComponent.prototype.onSelectAnimation = function (data) {
	    this.selected.userData.Animation = {};
	    Object.assign(this.selected.userData.Animation, data);
	    this.updateUI();
	};

	/**
	 * 刚体组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function RigidBodyComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	RigidBodyComponent.prototype = Object.create(BaseComponent.prototype);
	RigidBodyComponent.prototype.constructor = RigidBodyComponent;

	RigidBodyComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'rigidBodyPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '刚体'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '形状'
	            }, {
	                xtype: 'input',
	                id: 'shape',
	                scope: this.id,
	                disabled: true,
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '质量'
	            }, {
	                xtype: 'number',
	                id: 'mass',
	                scope: this.id,
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '惯性'
	            }, {
	                xtype: 'number',
	                id: 'inertiaX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'inertiaY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'inertiaZ',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	RigidBodyComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	RigidBodyComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	RigidBodyComponent.prototype.updateUI = function () {
	    var container = UI.get('rigidBodyPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof THREE.Mesh && editor.selected.userData.physics) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var shape = UI.get('shape', this.id);
	    var mass = UI.get('mass', this.id);
	    var inertiaX = UI.get('inertiaX', this.id);
	    var inertiaY = UI.get('inertiaY', this.id);
	    var inertiaZ = UI.get('inertiaZ', this.id);

	    var physics = this.selected.userData.physics;

	    shape.setValue(physics.shape);
	    mass.setValue(physics.mass);
	    inertiaX.setValue(physics.inertia.x);
	    inertiaY.setValue(physics.inertia.y);
	    inertiaZ.setValue(physics.inertia.z);
	};

	RigidBodyComponent.prototype.onChange = function () {
	    var shape = UI.get('shape', this.id);
	    var mass = UI.get('mass', this.id);
	    var inertiaX = UI.get('inertiaX', this.id);
	    var inertiaY = UI.get('inertiaY', this.id);
	    var inertiaZ = UI.get('inertiaZ', this.id);

	    var physics = this.selected.userData.physics;

	    physics.shape = shape.getValue();
	    physics.mass = mass.getValue();
	    physics.inertia.x = inertiaX.getValue();
	    physics.inertia.y = inertiaY.getValue();
	    physics.inertia.z = inertiaZ.getValue();
	};

	/**
	 * 天空组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function SkyComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	SkyComponent.prototype = Object.create(BaseComponent.prototype);
	SkyComponent.prototype.constructor = SkyComponent;

	SkyComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'skyPanel',
	        scope: this.id,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '天空'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '浑浊度'
	            }, {
	                xtype: 'number',
	                id: 'turbidity',
	                scope: this.id,
	                range: [0, Infinity],
	                value: 10,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '瑞利'
	            }, {
	                xtype: 'number',
	                id: 'rayleigh',
	                scope: this.id,
	                range: [0, Infinity],
	                value: 2,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '亮度'
	            }, {
	                xtype: 'number',
	                id: 'luminance',
	                scope: this.id,
	                range: [0, Infinity],
	                value: 1,
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: 'Mie系数'
	            }, {
	                xtype: 'number',
	                id: 'mieCoefficient',
	                scope: this.id,
	                range: [0, Infinity],
	                value: 0.005,
	                unit: '%',
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: 'Mie方向'
	            }, {
	                xtype: 'number',
	                id: 'mieDirectionalG',
	                scope: this.id,
	                range: [0, Infinity],
	                value: 0.005,
	                onChange: this.onChange.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	};

	SkyComponent.prototype.onObjectSelected = function () {
	    this.updateUI();
	};

	SkyComponent.prototype.onObjectChanged = function () {
	    this.updateUI();
	};

	SkyComponent.prototype.updateUI = function () {
	    var container = UI.get('skyPanel', this.id);
	    var editor = this.app.editor;
	    if (editor.selected && editor.selected instanceof Sky) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.selected = editor.selected;

	    var turbidity = UI.get('turbidity', this.id);
	    var rayleigh = UI.get('rayleigh', this.id);
	    var luminance = UI.get('luminance', this.id);
	    var mieCoefficient = UI.get('mieCoefficient', this.id);
	    var mieDirectionalG = UI.get('mieDirectionalG', this.id);

	    turbidity.setValue(this.selected.userData.turbidity);
	    rayleigh.setValue(this.selected.userData.rayleigh);
	    luminance.setValue(this.selected.userData.luminance);
	    mieCoefficient.setValue(this.selected.userData.mieCoefficient * 100);
	    mieDirectionalG.setValue(this.selected.userData.mieDirectionalG);
	};

	SkyComponent.prototype.onChange = function () {
	    var turbidity = UI.get('turbidity', this.id);
	    var rayleigh = UI.get('rayleigh', this.id);
	    var luminance = UI.get('luminance', this.id);
	    var mieCoefficient = UI.get('mieCoefficient', this.id);
	    var mieDirectionalG = UI.get('mieDirectionalG', this.id);

	    this.selected.userData.turbidity = turbidity.getValue();
	    this.selected.userData.rayleigh = rayleigh.getValue();
	    this.selected.userData.luminance = luminance.getValue();
	    this.selected.userData.mieCoefficient = mieCoefficient.getValue() / 100;
	    this.selected.userData.mieDirectionalG = mieDirectionalG.getValue();

	    var sky = this.selected.children.filter(n => n instanceof THREE.Sky)[0];
	    if (sky) {
	        var uniforms = sky.material.uniforms;
	        uniforms.turbidity.value = turbidity.getValue();
	        uniforms.rayleigh.value = rayleigh.getValue();
	        uniforms.luminance.value = luminance.getValue();
	        uniforms.mieCoefficient.value = mieCoefficient.getValue() / 100;
	        uniforms.mieDirectionalG.value = mieDirectionalG.getValue();
	        sky.material.needsUpdate = true;
	    }

	    this.app.call(`objectSelected`, this, this.selected);
	};

	/**
	 * 属性面板
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function PropertyPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	PropertyPanel.prototype = Object.create(UI$1.Control.prototype);
	PropertyPanel.prototype.constructor = PropertyPanel;

	PropertyPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        children: [
	            new BasicComponent({ app: this.app }),
	            new TransformComponent({ app: this.app }),
	            new SceneComponent({ app: this.app }),
	            new CameraComponent({ app: this.app }),
	            new LightComponent({ app: this.app }),
	            new ShadowComponent({ app: this.app }),
	            new ReflectorComponent({ app: this.app }),
	            new SkyComponent({ app: this.app }),
	            new AudioListenerComponent({ app: this.app }),
	            new BackgroundMusicComponent({ app: this.app }),
	            new PhysicsWorldComponent({ app: this.app }),
	            new ParticleEmitterComponent({ app: this.app }),
	            new FireComponent({ app: this.app }),
	            new SmokeComponent({ app: this.app }),
	            new LMeshComponent({ app: this.app }),
	            new MMDComponent({ app: this.app }),
	            new RigidBodyComponent({ app: this.app }),
	            new GeometryComponent({ app: this.app }),
	            new MaterialComponent({ app: this.app })
	        ]
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 动画基本信息组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function BasicAnimationComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	BasicAnimationComponent.prototype = Object.create(BaseComponent.prototype);
	BasicAnimationComponent.prototype.constructor = BasicAnimationComponent;

	BasicAnimationComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'basicAnimationPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            borderTop: 0,
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '基本信息'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'name',
	                scope: this.id,
	                style: {
	                    width: '120px'
	                },
	                onInput: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '目标'
	            }, {
	                xtype: 'input',
	                id: 'target',
	                scope: this.id,
	                disabled: true,
	                style: {
	                    width: '80px',
	                    marginRight: '8px'
	                }
	            }, {
	                xtype: 'button',
	                id: 'btnSetTarget',
	                scope: this.id,
	                text: '设置',
	                onClick: this.onSetTarget.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'select',
	                id: 'type',
	                scope: this.id,
	                options: {
	                    Tween: '补间动画',
	                    Skeletal: '骨骼动画',
	                    Audio: '播放音乐',
	                    Filter: '滤镜动画',
	                    Particle: '粒子动画'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始时间'
	            }, {
	                xtype: 'number',
	                id: 'beginTime',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '结束时间'
	            }, {
	                xtype: 'number',
	                id: 'endTime',
	                scope: this.id,
	                range: [0, Infinity],
	                onChange: this.onChange.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`animationSelected.${this.id}`, this.onAnimationSelected.bind(this));
	    this.app.on(`animationChanged.${this.id}`, this.onAnimationChanged.bind(this));
	};

	BasicAnimationComponent.prototype.onAnimationSelected = function (animation) {
	    this.updateUI(animation);
	};

	BasicAnimationComponent.prototype.onAnimationChanged = function (animation) {
	    this.updateUI(animation);
	};

	BasicAnimationComponent.prototype.updateUI = function (animation) {
	    var container = UI.get('basicAnimationPanel', this.id);
	    if (animation) {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.animation = animation;

	    var name = UI.get('name', this.id);
	    var target = UI.get('target', this.id);
	    var type = UI.get('type', this.id);
	    var beginTime = UI.get('beginTime', this.id);
	    var endTime = UI.get('endTime', this.id);

	    name.setValue(this.animation.name);

	    if (this.animation.target === null) {
	        target.setValue('(无)');
	    } else {
	        var obj = this.app.editor.objectByUuid(this.animation.target);
	        if (obj === null) {
	            target.setValue('(无)');
	            console.warn(`BasicAnimationComponent: 动作物体${this.animation.target}在场景中不存在。`);
	        } else {
	            target.setValue(obj.name);
	        }
	    }

	    type.setValue(this.animation.type);
	    beginTime.setValue(this.animation.beginTime);
	    endTime.setValue(this.animation.endTime);
	};

	BasicAnimationComponent.prototype.onSetTarget = function () {
	    var selected = this.app.editor.selected;
	    if (selected == null) {
	        this.animation.target = null;
	    } else {
	        this.animation.target = selected.uuid;
	    }

	    this.app.call('animationChanged', this, this.animation);
	};

	BasicAnimationComponent.prototype.onChange = function () {
	    var name = UI.get('name', this.id);
	    var type = UI.get('type', this.id);
	    var beginTime = UI.get('beginTime', this.id);
	    var endTime = UI.get('endTime', this.id);

	    this.animation.name = name.getValue();
	    this.animation.type = type.getValue();
	    this.animation.beginTime = beginTime.getValue();
	    this.animation.endTime = endTime.getValue();

	    this.app.call('animationChanged', this, this.animation);
	};

	/**
	 * 补间动画组件
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TweenAnimationComponent(options) {
	    BaseComponent.call(this, options);
	    this.selected = null;
	}

	TweenAnimationComponent.prototype = Object.create(BaseComponent.prototype);
	TweenAnimationComponent.prototype.constructor = TweenAnimationComponent;

	TweenAnimationComponent.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        id: 'tweenAnimationPanel',
	        scope: this.id,
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            display: 'none'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    width: '100%',
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '补间动画'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '开始状态'
	            }, {
	                xtype: 'select',
	                id: 'beginStatus',
	                scope: this.id,
	                options: {
	                    Current: '当前状态',
	                    Custom: '自定义'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'beginPositionRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '平移'
	            }, {
	                xtype: 'number',
	                id: 'beginPositionX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginPositionY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginPositionZ',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'beginRotationRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '旋转'
	            }, {
	                xtype: 'number',
	                id: 'beginRotationX',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginRotationY',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginRotationZ',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'beginScaleRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '缩放'
	            }, {
	                xtype: 'checkbox',
	                id: 'beginScaleLock',
	                scope: this.id,
	                value: true,
	                style: {
	                    position: 'absolute',
	                    left: '50px'
	                }
	            }, {
	                xtype: 'number',
	                id: 'beginScaleX',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginScaleY',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'beginScaleZ',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '插值函数'
	            }, {
	                xtype: 'select',
	                id: 'ease',
	                scope: this.id,
	                options: {
	                    linear: 'Linear',
	                    quadIn: 'Quad In',
	                    quadOut: 'Quad Out',
	                    quadInOut: 'Quad In Out',
	                    cubicIn: 'Cubic In',
	                    cubicOut: 'Cubic Out',
	                    cubicInOut: 'Cubic InOut',
	                    quartIn: 'Quart In',
	                    quartOut: 'Quart Out',
	                    quartInOut: 'Quart InOut',
	                    quintIn: 'Quint In',
	                    quintOut: 'Quint Out',
	                    quintInOut: 'Quint In Out',
	                    sineIn: 'Sine In',
	                    sineOut: 'Sine Out',
	                    sineInOut: 'Sine In Out',
	                    backIn: 'Back In',
	                    backOut: 'Back Out',
	                    backInOut: 'Back In Out',
	                    circIn: 'Circ In',
	                    circOut: 'Circ Out',
	                    circInOut: 'Circ In Out',
	                    bounceIn: 'Bounce In',
	                    bounceOut: 'Bounce Out',
	                    bounceInOut: 'Bounce In Out',
	                    elasticIn: 'Elastic In',
	                    elasticOut: 'Elastic Out',
	                    elasticInOut: 'Elastic In Out'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '结束状态'
	            }, {
	                xtype: 'select',
	                id: 'endStatus',
	                scope: this.id,
	                options: {
	                    Current: '当前状态',
	                    Custom: '自定义'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'endPositionRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '平移'
	            }, {
	                xtype: 'number',
	                id: 'endPositionX',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endPositionY',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endPositionZ',
	                scope: this.id,
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'endRotationRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '旋转'
	            }, {
	                xtype: 'number',
	                id: 'endRotationX',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endRotationY',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endRotationZ',
	                scope: this.id,
	                step: 10,
	                unit: '°',
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            id: 'endScaleRow',
	            scope: this.id,
	            style: {
	                display: 'none'
	            },
	            children: [{
	                xtype: 'label',
	                text: '缩放'
	            }, {
	                xtype: 'checkbox',
	                id: 'endScaleLock',
	                scope: this.id,
	                value: true,
	                style: {
	                    position: 'absolute',
	                    left: '50px'
	                }
	            }, {
	                xtype: 'number',
	                id: 'endScaleX',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endScaleY',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }, {
	                xtype: 'number',
	                id: 'endScaleZ',
	                scope: this.id,
	                value: 1,
	                range: [0.01, Infinity],
	                style: {
	                    width: '40px'
	                },
	                onChange: this.onChange.bind(this)
	            }]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`animationSelected.${this.id}`, this.onAnimationSelected.bind(this));
	    this.app.on(`animationChanged.${this.id}`, this.onAnimationChanged.bind(this));
	};

	TweenAnimationComponent.prototype.onAnimationSelected = function (animation) {
	    this.updateUI(animation);
	};

	TweenAnimationComponent.prototype.onAnimationChanged = function (animation) {
	    this.updateUI(animation);
	};

	TweenAnimationComponent.prototype.updateUI = function (animation) {
	    var container = UI.get('tweenAnimationPanel', this.id);
	    if (animation && animation.type === 'Tween') {
	        container.dom.style.display = '';
	    } else {
	        container.dom.style.display = 'none';
	        return;
	    }

	    this.animation = animation;

	    var beginPositionRow = UI.get('beginPositionRow', this.id);
	    var beginRotationRow = UI.get('beginRotationRow', this.id);
	    var beginScaleRow = UI.get('beginScaleRow', this.id);
	    var endPositionRow = UI.get('endPositionRow', this.id);
	    var endRotationRow = UI.get('endRotationRow', this.id);
	    var endScaleRow = UI.get('endScaleRow', this.id);

	    var beginStatus = UI.get('beginStatus', this.id);
	    var beginPositionX = UI.get('beginPositionX', this.id);
	    var beginPositionY = UI.get('beginPositionY', this.id);
	    var beginPositionZ = UI.get('beginPositionZ', this.id);
	    var beginRotationX = UI.get('beginRotationX', this.id);
	    var beginRotationY = UI.get('beginRotationY', this.id);
	    var beginRotationZ = UI.get('beginRotationZ', this.id);
	    var beginScaleLock = UI.get('beginScaleLock', this.id);
	    var beginScaleX = UI.get('beginScaleX', this.id);
	    var beginScaleY = UI.get('beginScaleY', this.id);
	    var beginScaleZ = UI.get('beginScaleZ', this.id);
	    var ease = UI.get('ease', this.id);
	    var endStatus = UI.get('endStatus', this.id);
	    var endPositionX = UI.get('endPositionX', this.id);
	    var endPositionY = UI.get('endPositionY', this.id);
	    var endPositionZ = UI.get('endPositionZ', this.id);
	    var endRotationX = UI.get('endRotationX', this.id);
	    var endRotationY = UI.get('endRotationY', this.id);
	    var endRotationZ = UI.get('endRotationZ', this.id);
	    var endScaleLock = UI.get('endScaleLock', this.id);
	    var endScaleX = UI.get('endScaleX', this.id);
	    var endScaleY = UI.get('endScaleY', this.id);
	    var endScaleZ = UI.get('endScaleZ', this.id);

	    switch (this.animation.beginStatus) {
	        case 'Current':
	            beginPositionRow.dom.style.display = 'none';
	            beginRotationRow.dom.style.display = 'none';
	            beginScaleRow.dom.style.display = 'none';
	            break;
	        case 'Custom':
	            beginPositionRow.dom.style.display = '';
	            beginRotationRow.dom.style.display = '';
	            beginScaleRow.dom.style.display = '';
	            break;
	    }

	    switch (this.animation.endStatus) {
	        case 'Current':
	            endPositionRow.dom.style.display = 'none';
	            endRotationRow.dom.style.display = 'none';
	            endScaleRow.dom.style.display = 'none';
	            break;
	        case 'Custom':
	            endPositionRow.dom.style.display = '';
	            endRotationRow.dom.style.display = '';
	            endScaleRow.dom.style.display = '';
	            break;
	    }

	    beginStatus.setValue(this.animation.beginStatus);
	    beginPositionX.setValue(this.animation.beginPositionX);
	    beginPositionY.setValue(this.animation.beginPositionY);
	    beginPositionZ.setValue(this.animation.beginPositionZ);
	    beginRotationX.setValue(this.animation.beginRotationX * 180 / Math.PI);
	    beginRotationY.setValue(this.animation.beginRotationY * 180 / Math.PI);
	    beginRotationZ.setValue(this.animation.beginRotationZ * 180 / Math.PI);
	    beginScaleLock.setValue(this.animation.beginScaleLock);
	    beginScaleX.setValue(this.animation.beginScaleX);
	    beginScaleY.setValue(this.animation.beginScaleY);
	    beginScaleZ.setValue(this.animation.beginScaleZ);
	    ease.setValue(this.animation.ease);
	    endStatus.setValue(this.animation.endStatus);
	    endPositionX.setValue(this.animation.endPositionX);
	    endPositionY.setValue(this.animation.endPositionY);
	    endPositionZ.setValue(this.animation.endPositionZ);
	    endRotationX.setValue(this.animation.endRotationX * 180 / Math.PI);
	    endRotationY.setValue(this.animation.endRotationY * 180 / Math.PI);
	    endRotationZ.setValue(this.animation.endRotationZ * 180 / Math.PI);
	    endScaleLock.setValue(this.animation.endScaleLock);
	    endScaleX.setValue(this.animation.endScaleX);
	    endScaleY.setValue(this.animation.endScaleY);
	    endScaleZ.setValue(this.animation.endScaleZ);
	};

	TweenAnimationComponent.prototype.onChange = function () {
	    var beginPositionRow = UI.get('beginPositionRow', this.id);
	    var beginRotationRow = UI.get('beginRotationRow', this.id);
	    var beginScaleRow = UI.get('beginScaleRow', this.id);
	    var endPositionRow = UI.get('endPositionRow', this.id);
	    var endRotationRow = UI.get('endRotationRow', this.id);
	    var endScaleRow = UI.get('endScaleRow', this.id);

	    var beginStatus = UI.get('beginStatus', this.id);
	    var beginPositionX = UI.get('beginPositionX', this.id);
	    var beginPositionY = UI.get('beginPositionY', this.id);
	    var beginPositionZ = UI.get('beginPositionZ', this.id);
	    var beginRotationX = UI.get('beginRotationX', this.id);
	    var beginRotationY = UI.get('beginRotationY', this.id);
	    var beginRotationZ = UI.get('beginRotationZ', this.id);
	    var beginScaleLock = UI.get('beginScaleLock', this.id);
	    var beginScaleX = UI.get('beginScaleX', this.id);
	    var beginScaleY = UI.get('beginScaleY', this.id);
	    var beginScaleZ = UI.get('beginScaleZ', this.id);
	    var ease = UI.get('ease', this.id);
	    var endStatus = UI.get('endStatus', this.id);
	    var endPositionX = UI.get('endPositionX', this.id);
	    var endPositionY = UI.get('endPositionY', this.id);
	    var endPositionZ = UI.get('endPositionZ', this.id);
	    var endRotationX = UI.get('endRotationX', this.id);
	    var endRotationY = UI.get('endRotationY', this.id);
	    var endRotationZ = UI.get('endRotationZ', this.id);
	    var endScaleLock = UI.get('endScaleLock', this.id);
	    var endScaleX = UI.get('endScaleX', this.id);
	    var endScaleY = UI.get('endScaleY', this.id);
	    var endScaleZ = UI.get('endScaleZ', this.id);

	    switch (beginStatus.getValue()) {
	        case 'Current':
	            beginPositionRow.dom.style.display = 'none';
	            beginRotationRow.dom.style.display = 'none';
	            beginScaleRow.dom.style.display = 'none';
	            break;
	        case 'Custom':
	            beginPositionRow.dom.style.display = '';
	            beginRotationRow.dom.style.display = '';
	            beginScaleRow.dom.style.display = '';
	            break;
	    }

	    switch (endStatus.getValue()) {
	        case 'Current':
	            endPositionRow.dom.style.display = 'none';
	            endRotationRow.dom.style.display = 'none';
	            endScaleRow.dom.style.display = 'none';
	            break;
	        case 'Custom':
	            endPositionRow.dom.style.display = '';
	            endRotationRow.dom.style.display = '';
	            endScaleRow.dom.style.display = '';
	            break;
	    }

	    this.animation.beginStatus = beginStatus.getValue();
	    this.animation.beginPositionX = beginPositionX.getValue();
	    this.animation.beginPositionY = beginPositionY.getValue();
	    this.animation.beginPositionZ = beginPositionZ.getValue();
	    this.animation.beginRotationX = beginRotationX.getValue() * Math.PI / 180;
	    this.animation.beginRotationY = beginRotationY.getValue() * Math.PI / 180;
	    this.animation.beginRotationZ = beginRotationZ.getValue() * Math.PI / 180;
	    this.animation.beginScaleLock = beginScaleLock.getValue();
	    this.animation.beginScaleX = beginScaleX.getValue();
	    this.animation.beginScaleY = beginScaleY.getValue();
	    this.animation.beginScaleZ = beginScaleZ.getValue();
	    this.animation.ease = ease.getValue();
	    this.animation.endStatus = endStatus.getValue();
	    this.animation.endPositionX = endPositionX.getValue();
	    this.animation.endPositionY = endPositionY.getValue();
	    this.animation.endPositionZ = endPositionZ.getValue();
	    this.animation.endRotationX = endRotationX.getValue() * Math.PI / 180;
	    this.animation.endRotationY = endRotationY.getValue() * Math.PI / 180;
	    this.animation.endRotationZ = endRotationZ.getValue() * Math.PI / 180;
	    this.animation.endScaleLock = endScaleLock.getValue();
	    this.animation.endScaleX = endScaleX.getValue();
	    this.animation.endScaleY = endScaleY.getValue();
	    this.animation.endScaleZ = endScaleZ.getValue();

	    this.app.call('animationChanged', this, this.animation);
	};

	/**
	 * 动画面板
	 */
	function AnimationPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	AnimationPanel.prototype = Object.create(UI$1.Control.prototype);
	AnimationPanel.prototype.constructor = AnimationPanel;

	AnimationPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        children: [
	            new BasicAnimationComponent({ app: this.app }),
	            new TweenAnimationComponent({ app: this.app }),
	        ]
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 设置面板
	 * @author tengge / https://github.com/tengge1
	 */
	function SettingPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	SettingPanel.prototype = Object.create(UI$1.Control.prototype);
	SettingPanel.prototype.constructor = SettingPanel;

	SettingPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            borderTop: 0,
	            paddingTop: '20px'
	        },
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                style: {
	                    color: '#555',
	                    fontWeight: 'bold'
	                },
	                text: '帮助器'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '网格'
	            }, {
	                xtype: 'boolean',
	                id: 'showGrid',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '相机'
	            }, {
	                xtype: 'boolean',
	                id: 'showCamera',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '点光源'
	            }, {
	                xtype: 'boolean',
	                id: 'showPointLight',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '平行光'
	            }, {
	                xtype: 'boolean',
	                id: 'showDirectionalLight',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '聚光灯'
	            }, {
	                xtype: 'boolean',
	                id: 'showSpotLight',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '半球光'
	            }, {
	                xtype: 'boolean',
	                id: 'showHemisphereLight',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '矩形光'
	            }, {
	                xtype: 'boolean',
	                id: 'showRectAreaLight',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '骨骼'
	            }, {
	                xtype: 'boolean',
	                id: 'showSkeleton',
	                scope: this.id,
	                onChange: this.update.bind(this)
	            }]
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`tabSelected.${this.id}`, this.onTabSelected.bind(this));
	};

	SettingPanel.prototype.onTabSelected = function (tabName) {
	    if (tabName !== 'setting') {
	        return;
	    }

	    // 帮助器
	    var showGrid = UI$1.get('showGrid', this.id);
	    showGrid.setValue(this.app.options.showGrid);

	    var showCamera = UI$1.get('showCamera', this.id);
	    showCamera.setValue(this.app.options.showCameraHelper);

	    var showPointLight = UI$1.get('showPointLight', this.id);
	    showPointLight.setValue(this.app.options.showPointLightHelper);

	    var showDirectionalLight = UI$1.get('showDirectionalLight', this.id);
	    showDirectionalLight.setValue(this.app.options.showDirectionalLightHelper);

	    var showSpotLight = UI$1.get('showSpotLight', this.id);
	    showSpotLight.setValue(this.app.options.showSpotLightHelper);

	    var showHemisphereLight = UI$1.get('showHemisphereLight', this.id);
	    showHemisphereLight.setValue(this.app.options.showHemisphereLightHelper);

	    var showRectAreaLight = UI$1.get('showRectAreaLight', this.id);
	    showRectAreaLight.setValue(this.app.options.showRectAreaLightHelper);

	    var showSkeleton = UI$1.get('showSkeleton', this.id);
	    showSkeleton.setValue(this.app.options.showSkeletonHelper);
	};

	SettingPanel.prototype.update = function () {
	    // 帮助器
	    var showGrid = UI$1.get('showGrid', this.id).getValue();
	    this.app.options.showGrid = showGrid;
	    this.app.editor.grid.visible = showGrid;

	    var showCamera = UI$1.get('showCamera', this.id).getValue();
	    this.app.options.showCameraHelper = showCamera;

	    var showPointLight = UI$1.get('showPointLight', this.id).getValue();
	    this.app.options.showPointLightHelper = showPointLight;

	    var showDirectionalLight = UI$1.get('showDirectionalLight', this.id).getValue();
	    this.app.options.showDirectionalLightHelper = showDirectionalLight;

	    var showSpotLight = UI$1.get('showSpotLight', this.id).getValue();
	    this.app.options.showSpotLightHelper = showSpotLight;

	    var showHemisphereLight = UI$1.get('showHemisphereLight', this.id).getValue();
	    this.app.options.showHemisphereLightHelper = showHemisphereLight;

	    var showRectAreaLight = UI$1.get('showRectAreaLight', this.id).getValue();
	    this.app.options.showRectAreaLightHelper = showRectAreaLight;

	    var showSkeleton = UI$1.get('showSkeleton', this.id).getValue();
	    this.app.options.showSkeletonHelper = showSkeleton;

	    Object.values(this.app.editor.helpers).forEach(n => {
	        if (n instanceof THREE.CameraHelper) {
	            n.visible = showCamera;
	        } else if (n instanceof THREE.PointLightHelper) {
	            n.visible = showPointLight;
	        } else if (n instanceof THREE.DirectionalLightHelper) {
	            n.visible = showDirectionalLight;
	        } else if (n instanceof THREE.SpotLightHelper) {
	            n.visible = showSpotLight;
	        } else if (n instanceof THREE.HemisphereLightHelper) {
	            n.visible = showHemisphereLight;
	        } else if (n instanceof THREE.RectAreaLightHelper) {
	            n.visible = showRectAreaLight;
	        } else if (n instanceof THREE.SkeletonHelper) {
	            n.visible = showSkeleton;
	        }
	    });
	};

	/**
	 * 历史记录面板
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */
	function HistoryPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	HistoryPanel.prototype = Object.create(UI$1.Control.prototype);
	HistoryPanel.prototype.constructor = HistoryPanel;

	HistoryPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        children: [{
	            xtype: 'label',
	            text: '历史记录'
	        }, {
	            xtype: 'br'
	        }, {
	            xtype: 'br'
	        }, {
	            xtype: 'outliner',
	            id: 'historyOutlinear',
	            onChange: this.onChange.bind(this)
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	    this.app.on(`editorCleared.${this.id}`, this.refreshUI.bind(this));
	    this.app.on(`historyChanged.${this.id}`, this.refreshUI.bind(this));
	};

	HistoryPanel.prototype.onAppStarted = function () {
	    var outliner = UI$1.get('historyOutlinear');
	    outliner.editor = this.app.editor;
	    this.refreshUI();
	};

	HistoryPanel.prototype.refreshUI = function () {
	    var history = this.app.editor.history;
	    var outliner = UI$1.get('historyOutlinear');

	    var options = [];

	    function buildOption(object) {
	        var option = document.createElement('div');
	        option.value = object.id;
	        return option;
	    }

	    (function addObjects(objects) {
	        for (var i = 0, l = objects.length; i < l; i++) {
	            var object = objects[i];
	            var option = buildOption(object);
	            option.innerHTML = '&nbsp;' + object.name;
	            options.push(option);
	        }
	    })(history.undos);


	    (function addObjects(objects, pad) {
	        for (var i = objects.length - 1; i >= 0; i--) {
	            var object = objects[i];
	            var option = buildOption(object);
	            option.innerHTML = '&nbsp;' + object.name;
	            option.style.opacity = 0.3;
	            options.push(option);
	        }
	    })(history.redos, '&nbsp;');

	    outliner.setOptions(options);
	};

	HistoryPanel.prototype.onChange = function () {
	    var history = this.app.editor.history;
	    var outliner = UI$1.get('historyOutlinear');

	    history.goToState(parseInt(outliner.getValue()));
	};

	/**
	 * 侧边栏
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Sidebar(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	Sidebar.prototype = Object.create(UI$1.Control.prototype);
	Sidebar.prototype.constructor = Sidebar;

	Sidebar.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'sidebar',
	        children: [{
	            xtype: 'div',
	            cls: 'tabs',
	            style: {
	                position: 'sticky',
	                top: 0,
	                zIndex: 10
	            },
	            children: [{
	                xtype: 'text',
	                id: 'propertyTab',
	                scope: this.id,
	                text: '属性',
	                onClick: () => {
	                    this.app.call('tabSelected', this, 'property');
	                }
	            }, {
	                xtype: 'text',
	                id: 'animationTab',
	                scope: this.id,
	                text: '动画',
	                onClick: () => {
	                    this.app.call('tabSelected', this, 'animation');
	                }
	            }, {
	                xtype: 'text',
	                id: 'settingTab',
	                scope: this.id,
	                text: '设置',
	                onClick: () => {
	                    this.app.call('tabSelected', this, 'setting');
	                }
	            }, {
	                xtype: 'text',
	                id: 'historyTab',
	                scope: this.id,
	                text: '历史',
	                onClick: () => {
	                    this.app.call('tabSelected', this, 'history');
	                }
	            }]
	        }, {
	            xtype: 'div',
	            id: 'propertyPanel',
	            scope: this.id,
	            children: [
	                new PropertyPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'animationPanel',
	            scope: this.id,
	            children: [
	                new AnimationPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'settingPanel',
	            scope: this.id,
	            children: [
	                new SettingPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'historyPanel',
	            scope: this.id,
	            children: [
	                new HistoryPanel({ app: this.app })
	            ]
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	    this.app.on(`tabSelected.${this.id}`, this.onTabSelected.bind(this));
	};

	Sidebar.prototype.onAppStarted = function () {
	    this.app.call('tabSelected', this, 'property');
	};

	Sidebar.prototype.onTabSelected = function (tabName) {
	    var tabNames = [
	        'property',
	        'animation',
	        'setting',
	        'history'
	    ];
	    if (tabNames.indexOf(tabName) === -1) {
	        return;
	    }

	    var propertyTab = UI$1.get('propertyTab', this.id);
	    var animationTab = UI$1.get('animationTab', this.id);
	    var settingTab = UI$1.get('settingTab', this.id);
	    var historyTab = UI$1.get('historyTab', this.id);

	    var propertyPanel = UI$1.get('propertyPanel', this.id);
	    var animationPanel = UI$1.get('animationPanel', this.id);
	    var settingPanel = UI$1.get('settingPanel', this.id);
	    var historyPanel = UI$1.get('historyPanel', this.id);

	    propertyTab.dom.className = '';
	    animationTab.dom.className = '';
	    settingTab.dom.className = '';
	    historyTab.dom.className = '';

	    propertyPanel.dom.style.display = 'none';
	    animationPanel.dom.style.display = 'none';
	    settingPanel.dom.style.display = 'none';
	    historyPanel.dom.style.display = 'none';

	    switch (tabName) {
	        case 'property':
	            propertyTab.dom.className = 'selected';
	            propertyPanel.dom.style.display = '';
	            break;
	        case 'animation':
	            animationTab.dom.className = 'selected';
	            animationPanel.dom.style.display = '';
	            break;
	        case 'setting':
	            settingTab.dom.className = 'selected';
	            settingPanel.dom.style.display = '';
	            break;
	        case 'history':
	            historyTab.dom.className = 'selected';
	            historyPanel.dom.style.display = '';
	            break;
	    }
	};

	/**
	 * 场景层次图面板
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function HierachyPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	HierachyPanel.prototype = Object.create(UI$1.Control.prototype);
	HierachyPanel.prototype.constructor = HierachyPanel;

	HierachyPanel.prototype.render = function () {
	    var editor = this.app.editor;

	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            paddingTop: '10px'
	        },
	        children: [{
	            xtype: 'outliner',
	            id: 'outliner',
	            editor: editor,
	            onChange: this.onChange.bind(this),
	            onDblClick: this.onDblClick.bind(this)
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	    this.app.on(`editorCleared.${this.id}`, this.refreshUI.bind(this));
	    this.app.on(`sceneGraphChanged.${this.id}`, this.refreshUI.bind(this));
	    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
	    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
	};

	HierachyPanel.prototype.onChange = function () {
	    var editor = this.app.editor;
	    var outliner = UI$1.get('outliner');

	    editor.selectById(parseInt(outliner.getValue()));
	};

	HierachyPanel.prototype.onDblClick = function () {
	    var editor = this.app.editor;
	    var outliner = UI$1.get('outliner');

	    editor.focusById(parseInt(outliner.getValue()));
	};

	HierachyPanel.prototype.onAppStarted = function () {
	    this.refreshUI();
	};

	/**
	 * 场景物体改变
	 * @param {*} object 
	 */
	HierachyPanel.prototype.onObjectChanged = function (object) {
	    var outliner = UI$1.get('outliner');

	    var options = outliner.options;

	    for (var i = 0; i < options.length; i++) {
	        var option = options[i];

	        if (option.value === object.id) {
	            option.innerHTML = this.buildHTML(object);
	            return;
	        }
	    }
	};

	/**
	 * 选中物体改变
	 * @param {*} object 
	 */
	HierachyPanel.prototype.onObjectSelected = function (object) {
	    var outliner = UI$1.get('outliner');
	    outliner.setValue(object !== null ? object.id : null);
	};

	// outliner
	HierachyPanel.prototype.buildOption = function (object, draggable) {
	    var option = document.createElement('div');
	    option.draggable = draggable;
	    option.innerHTML = this.buildHTML(object);
	    option.value = object.id;
	    return option;
	};

	HierachyPanel.prototype.buildHTML = function (object) {
	    var html = '<span class="type ' + object.type + '"></span> ' + object.name;

	    if (object instanceof THREE.Mesh) {
	        var geometry = object.geometry;
	        var material = object.material;

	        html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
	        html += ' <span class="type ' + material.type + '"></span> ' + (material.name == null ? '' : material.name);
	    }

	    html += this.getScript(object.uuid);
	    return html;
	};

	HierachyPanel.prototype.getScript = function (uuid) {
	    var editor = this.app.editor;

	    if (editor.scripts[uuid] !== undefined) {
	        return ' <span class="type Script"></span>';
	    }

	    return '';
	};

	HierachyPanel.prototype.refreshUI = function () {
	    var editor = this.app.editor;
	    var camera = editor.camera;
	    var scene = editor.scene;
	    var outliner = UI$1.get('outliner');

	    if (outliner.editor === undefined) {
	        outliner.editor = editor;
	    }

	    var options = [];

	    options.push(this.buildOption(camera, false));
	    options.push(this.buildOption(scene, false));

	    var _this = this;

	    (function addObjects(objects, pad) {
	        for (var i = 0, l = objects.length; i < l; i++) {
	            var object = objects[i];

	            var option = _this.buildOption(object, true);
	            option.style.paddingLeft = (pad * 10) + 'px';
	            options.push(option);

	            addObjects(object.children, pad + 1);
	        }
	    })(scene.children, 1);

	    outliner.setOptions(options);

	    if (editor.selected !== null) {
	        outliner.setValue(editor.selected.id);
	    }
	};

	/**
	 * 添加脚本命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param script javascript object
	 * @constructor
	 */
	var AddScriptCommand = function (object, script) {
		Command.call(this);

		this.type = 'AddScriptCommand';
		this.name = '添加脚本';

		this.object = object;
		this.script = script;
	};

	AddScriptCommand.prototype = Object.create(Command.prototype);

	Object.assign(AddScriptCommand.prototype, {
		constructor: AddScriptCommand,

		execute: function () {
			if (this.editor.scripts[this.object.uuid] === undefined) {
				this.editor.scripts[this.object.uuid] = [];
			}

			this.editor.scripts[this.object.uuid].push(this.script);
			this.editor.app.call('scriptAdded', this, this.script);
		},

		undo: function () {
			if (this.editor.scripts[this.object.uuid] === undefined) return;

			var index = this.editor.scripts[this.object.uuid].indexOf(this.script);

			if (index !== - 1) {
				this.editor.scripts[this.object.uuid].splice(index, 1);
			}

			this.editor.app.call('scriptRemoved', this, this.script);
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.script = this.script;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.script = json.script;
			this.object = this.editor.objectByUuid(json.objectUuid);
		}
	});

	var JavaScriptStarter = `
// 场景渲染前执行一次
function init() {

}

// 场景渲染后执行一次
function start() {

}

// 程序运行过程中，每帧都要执行
function update(clock, deltaTime) {

}

// 程序结束运行后执行一次
function stop() {

}

// 监听鼠标点击事件
function onClick(event) {

}

// 监听鼠标双击事件
function onDblClick(event) {

}

// 监听键盘按下事件
function onKeyDown(event) {

}

// 监听键盘抬起事件
function onKeyUp(event) {

}

// 监听鼠标按下事件
function onMouseDown(event) {

}

// 监听鼠标移动事件
function onMouseMove(event) {

}

// 监听鼠标抬起事件
function onMouseUp(event) {

}

// 监听鼠标滚轮事件
function onMouseWheel(event) {

}

// 监听屏幕大小改变事件
function onResize(event) {

}
`;

	var VertexShaderStarter = `
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

void main()	{
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

	var FragmentShaderStarter = `
precision mediump float;

void main()	{
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

	var JsonStarter = `
{
    "defines": {

    },
    "uniforms": {

    },
    "attributes": {

    }
}
`;

	/**
	 * 脚本创建窗口
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function ScriptWindow(options) {
	    UI$1.Control.call(this, options);
	    options = options || {};

	    this.app = options.app;
	}

	ScriptWindow.prototype = Object.create(UI$1.Control.prototype);
	ScriptWindow.prototype.constructor = ScriptWindow;

	ScriptWindow.prototype.render = function () {
	    var container = UI$1.create({
	        xtype: 'window',
	        id: 'scriptWindow',
	        scope: this.id,
	        parent: this.app.container,
	        title: '创建脚本',
	        width: '350px',
	        height: '220px',
	        bodyStyle: {
	            paddingTop: '32px'
	        },
	        shade: false,
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '名称'
	            }, {
	                xtype: 'input',
	                id: 'scriptName',
	                scope: this.id,
	                text: '未命名'
	            }]
	        }, {
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '类型'
	            }, {
	                xtype: 'select',
	                id: 'scriptType',
	                scope: this.id,
	                options: {
	                    'javascript': 'JavaScript',
	                    'vertexShader': '顶点着色器',
	                    'fragmentShader': '片源着色器',
	                    'json': '着色器程序信息'
	                },
	                value: 'javascript',
	                disabled: true
	            }]
	        }],
	        buttons: [{
	            xtype: 'button',
	            text: '确定',
	            onClick: this.onCreateScript.bind(this)
	        }, {
	            xtype: 'button',
	            text: '取消',
	            onClick: this.onCancelScript.bind(this)
	        }]
	    });

	    container.render();
	};

	ScriptWindow.prototype.show = function () {
	    var container = UI$1.get('scriptWindow', this.id);
	    container.show();
	};

	ScriptWindow.prototype.hide = function () {
	    var container = UI$1.get('scriptWindow', this.id);
	    container.hide();
	};

	ScriptWindow.prototype.reset = function () {
	    var scriptName = UI$1.get('scriptName', this.id);
	    var scriptType = UI$1.get('scriptType', this.id);

	    scriptName.setValue('未命名');
	    scriptType.setValue('javascript');
	};

	ScriptWindow.prototype.onCreateScript = function () {
	    var scriptName = UI$1.get('scriptName', this.id).getValue();
	    var scriptType = UI$1.get('scriptType', this.id).getValue();

	    // 判断脚本名称是否重复
	    var scripts = Object.values(this.app.editor.scripts);
	    if (scripts.filter(n => n.name === scriptName).length > 0) {
	        UI$1.msg('脚本名称重复！');
	        return;
	    }

	    this.hide();

	    var initCode;

	    switch (scriptType) {
	        case 'javascript':
	            initCode = JavaScriptStarter;
	            break;
	        case 'vertexShader':
	            initCode = VertexShaderStarter;
	            break;
	        case 'fragmentShader':
	            initCode = FragmentShaderStarter;
	            break;
	        case 'json':
	            initCode = JsonStarter;
	            break;
	        default:
	            initCode = JavaScriptStarter;
	            break;
	    }

	    var uuid = THREE.Math.generateUUID();

	    this.app.script.open(uuid, scriptName, scriptType, initCode, scriptName, source => {
	        var script = this.app.editor.scripts[uuid];
	        script.source = source;
	    });

	    this.app.editor.scripts[uuid] = {
	        id: 0,
	        name: scriptName,
	        type: scriptType,
	        source: initCode,
	        uuid: uuid
	    };

	    this.app.call('scriptChanged', this);
	};

	ScriptWindow.prototype.onCancelScript = function () {
	    var container = UI$1.get('scriptWindow', this.id);
	    container.hide();
	};

	/**
	 * 脚本面板
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function ScriptPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	ScriptPanel.prototype = Object.create(UI$1.Control.prototype);
	ScriptPanel.prototype.constructor = ScriptPanel;

	ScriptPanel.prototype.render = function () {
	    var editor = this.app.editor;

	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel scriptPanel',
	        children: [{
	            xtype: 'row',
	            id: 'scriptsContainer'
	        }, {
	            xtype: 'button',
	            id: 'newCustomScript',
	            text: '新建脚本',
	            onClick: this.createNewScript.bind(this)
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`scriptChanged.${this.id}`, this.update.bind(this));
	};

	ScriptPanel.prototype.createNewScript = function () {
	    if (this.window == null) {
	        this.window = new ScriptWindow({
	            app: this.app
	        });
	        this.window.render();
	    }
	    this.window.reset();
	    this.window.show();
	};

	ScriptPanel.prototype.update = function () {
	    var container = UI$1.get('scriptsContainer');
	    container.dom.innerHTML = '';
	    container.dom.style.display = 'none';

	    var scripts = this.app.editor.scripts;

	    if (Object.keys(scripts).length === 0) {
	        return;
	    }

	    container.dom.style.display = 'block';

	    Object.keys(scripts).forEach(n => {
	        var script = scripts[n];
	        var uuid = script.uuid;
	        var name = script.name;
	        var extension;

	        switch (script.type) {
	            case 'javascript':
	                extension = '.js';
	                break;
	            case 'vertexShader':
	            case 'fragmentShader':
	                extension = '.glsl';
	                break;
	            case 'json':
	                extension = '.json';
	                break;
	        }

	        var data = {
	            xtype: 'container',
	            parent: container.dom,
	            children: [{
	                xtype: 'text',
	                text: name + extension,
	                style: {
	                    width: '100px',
	                    fontSize: '12px'
	                }
	            }, {
	                xtype: 'button',
	                text: '编辑',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: () => {
	                    this.editScript(uuid);
	                }
	            }, {
	                xtype: 'button',
	                text: '删除',
	                style: {
	                    marginLeft: '4px'
	                },
	                onClick: () => {
	                    this.deleteScript(uuid);
	                }
	            }, {
	                xtype: 'br'
	            }]
	        };

	        UI$1.create(data).render();
	    });
	};

	/**
	 * 编辑脚本
	 * @param {*} uuid 
	 */
	ScriptPanel.prototype.editScript = function (uuid) {
	    var script = this.app.editor.scripts[uuid];
	    if (script) {
	        this.app.script.open(uuid, script.name, script.type, script.source, script.name, source => {
	            script.source = source;
	        });
	    }
	};

	/**
	 * 删除脚本
	 * @param {*} uuid 
	 */
	ScriptPanel.prototype.deleteScript = function (uuid) {
	    var script = this.app.editor.scripts[uuid];

	    UI$1.confirm('询问', `是否删除脚本${script.name}？`, (event, btn) => {
	        if (btn === 'ok') {
	            delete this.app.editor.scripts[uuid];
	            this.app.call('scriptChanged', this);
	            UI$1.msg(`${script.name}删除成功！`);
	        }
	    });
	};

	/**
	 * 侧边栏2
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Sidebar$1(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	Sidebar$1.prototype = Object.create(UI$1.Control.prototype);
	Sidebar$1.prototype.constructor = Sidebar$1;

	Sidebar$1.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        cls: 'sidebar',
	        parent: this.parent,
	        children: [{
	            xtype: 'div',
	            cls: 'tabs',
	            children: [{
	                xtype: 'text',
	                text: '场景',
	                cls: 'selected'
	            }]
	        }, { // 场景面板
	            xtype: 'div',
	            children: [
	                new HierachyPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            cls: 'tabs',
	            children: [{
	                xtype: 'text',
	                text: '脚本',
	                cls: 'selected'
	            }]
	        }, {
	            xtype: 'div',
	            children: [
	                new ScriptPanel({ app: this.app })
	            ]
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	const STOP = 0;
	const PLAY = 1;
	const PAUSE = 2;

	/**
	 * 动画面板
	 * @author tengge / https://github.com/tengge1
	 */
	function AnimationPanel$1(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;

	    this.status = STOP;
	    this.sliderLeft = 0;
	    this.speed = 4;

	    this.isDragging = false;
	}
	AnimationPanel$1.prototype = Object.create(UI$1.Control.prototype);
	AnimationPanel$1.prototype.constructor = AnimationPanel$1;

	AnimationPanel$1.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'animation-panel',
	        children: [{
	            xtype: 'div',
	            cls: 'controls',
	            children: [{
	                xtype: 'iconbutton',
	                icon: 'icon-add',
	                onClick: this.onAddGroup.bind(this)
	            }, {
	                xtype: 'iconbutton',
	                icon: 'icon-delete',
	                onClick: this.onRemoveGroup.bind(this)
	            }, {
	                xtype: 'div',
	                style: {
	                    width: '2px',
	                    height: '20px',
	                    borderLeft: '1px solid #aaa',
	                    borderRight: '1px solid #aaa',
	                    boxSizing: 'border-box',
	                    margin: '5px 8px'
	                }
	            }, {
	                xtype: 'iconbutton',
	                icon: 'icon-backward',
	                onClick: this.onBackward.bind(this)
	            }, {
	                xtype: 'iconbutton',
	                id: 'btnPlay',
	                scope: this.id,
	                icon: 'icon-play',
	                onClick: this.onPlay.bind(this)
	            }, {
	                xtype: 'iconbutton',
	                id: 'btnPause',
	                scope: this.id,
	                icon: 'icon-pause',
	                style: {
	                    display: 'none'
	                },
	                onClick: this.onPause.bind(this)
	            }, {
	                xtype: 'iconbutton',
	                icon: 'icon-forward',
	                onClick: this.onForward.bind(this)
	            }, {
	                xtype: 'iconbutton',
	                icon: 'icon-stop',
	                onClick: this.onStop.bind(this)
	            }, {
	                xtype: 'text',
	                id: 'time',
	                scope: this.id,
	                style: {
	                    marginLeft: '8px',
	                    color: '#555',
	                    fontSize: '12px'
	                },
	                text: '00:00'
	            }, {
	                xtype: 'text',
	                id: 'speed',
	                scope: this.id,
	                style: {
	                    marginLeft: '8px',
	                    color: '#aaa',
	                    fontSize: '12px'
	                },
	                text: 'X 1'
	            }, {
	                xtype: 'toolbarfiller'
	            }, {
	                xtype: 'text',
	                scope: this.id,
	                style: {
	                    marginLeft: '8px',
	                    color: '#aaa',
	                    fontSize: '12px'
	                },
	                text: '说明：双击时间轴下方添加动画。'
	            }]
	        }, {
	            xtype: 'div',
	            cls: 'box',
	            children: [{
	                xtype: 'div',
	                cls: 'left-area',
	                id: 'groupInfo',
	                scope: this.id
	            }, {
	                xtype: 'div',
	                cls: 'right-area',
	                children: [{
	                    xtype: 'timeline',
	                    id: 'timeline',
	                    cls: 'timeline',
	                    scope: this.id
	                }, {
	                    xtype: 'div',
	                    cls: 'groups',
	                    id: 'groups',
	                    scope: this.id,
	                    children: []
	                }, {
	                    xtype: 'div',
	                    cls: 'slider',
	                    id: 'slider',
	                    scope: this.id
	                }]
	            }]
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	};

	AnimationPanel$1.prototype.onAppStarted = function () {
	    var timeline = UI$1.get('timeline', this.id);
	    var groups = UI$1.get('groups', this.id);

	    timeline.updateUI();
	    groups.dom.style.width = timeline.dom.clientWidth + 'px';

	    groups.dom.addEventListener(`click`, this.onClick.bind(this));
	    groups.dom.addEventListener(`dblclick`, this.onDblClick.bind(this));
	    groups.dom.addEventListener(`mousedown`, this.onMouseDown.bind(this));
	    groups.dom.addEventListener(`mousemove`, this.onMouseMove.bind(this));
	    document.body.addEventListener(`mouseup`, this.onMouseUp.bind(this));

	    this.app.on(`animationChanged.${this.id}`, this.updateUI.bind(this));

	    this.app.on(`resetAnimation.${this.id}`, this.onResetAnimation.bind(this));
	    this.app.on(`startAnimation.${this.id}`, this.onPlay.bind(this));
	};

	AnimationPanel$1.prototype.updateUI = function () {
	    var animations = this.app.editor.animation.getAnimationGroups();

	    var groupInfo = UI$1.get('groupInfo', this.id);
	    var timeline = UI$1.get('timeline', this.id);
	    var groups = UI$1.get('groups', this.id);

	    while (groupInfo.dom.children.length) {
	        var child = groupInfo.dom.children[0];
	        groupInfo.dom.removeChild(child);
	    }

	    while (groups.dom.children.length) {
	        var child = groups.dom.children[0];
	        child.data = null;
	        groups.dom.removeChild(child);
	    }

	    animations.forEach(n => {
	        // 动画组信息区
	        var groupName = document.createElement('div');
	        groupName.className = 'group-info';
	        groupName.innerHTML = `<input type="checkbox" data-uuid="${n.uuid}" />${n.name}`;
	        groupInfo.dom.appendChild(groupName);

	        // 动画区
	        var group = document.createElement('div');
	        group.className = 'group';
	        group.setAttribute('droppable', true);
	        group.data = n;
	        group.addEventListener('dragenter', this.onDragEnterGroup.bind(this));
	        group.addEventListener('dragover', this.onDragOverGroup.bind(this));
	        group.addEventListener('dragleave', this.onDragLeaveGroup.bind(this));
	        group.addEventListener('drop', this.onDropGroup.bind(this));
	        groups.dom.appendChild(group);

	        n.animations.forEach(m => {
	            var item = document.createElement('div');
	            item.data = m;
	            item.className = 'item';
	            item.setAttribute('draggable', true);
	            item.setAttribute('droppable', false);
	            item.style.left = m.beginTime * timeline.scale + 'px';
	            item.style.width = (m.endTime - m.beginTime) * timeline.scale + 'px';
	            item.innerHTML = m.name;
	            item.addEventListener('dragstart', this.onDragStartAnimation.bind(this));
	            item.addEventListener('dragend', this.onDragEndAnimation.bind(this));
	            group.appendChild(item);
	        });
	    });
	};

	AnimationPanel$1.prototype.updateSlider = function () {
	    var timeline = UI$1.get('timeline', this.id);
	    var slider = UI$1.get('slider', this.id);
	    var time = UI$1.get('time', this.id);
	    var speed = UI$1.get('speed', this.id);

	    slider.dom.style.left = this.sliderLeft + 'px';

	    var animationTime = this.sliderLeft / timeline.scale;

	    var minute = ('0' + Math.floor(animationTime / 60)).slice(-2);
	    var second = ('0' + Math.floor(animationTime % 60)).slice(-2);

	    time.setValue(`${minute}:${second}`);

	    if (this.speed >= 4) {
	        speed.dom.innerHTML = `X ${this.speed / 4}`;
	    } else {
	        speed.dom.innerHTML = `X 1/${4 / this.speed}`;
	    }

	    this.app.call('animationTime', this, animationTime);
	};

	AnimationPanel$1.prototype.onAnimate = function () {
	    var timeline = UI$1.get('timeline', this.id);
	    this.sliderLeft += this.speed / 4;

	    if (this.sliderLeft >= timeline.dom.clientWidth) {
	        this.sliderLeft = 0;
	    }

	    this.updateSlider();
	};

	AnimationPanel$1.prototype.onAddGroup = function () {
	    var group = new AnimationGroup();
	    this.app.editor.animation.add(group);
	    this.updateUI();
	};

	AnimationPanel$1.prototype.onRemoveGroup = function () {
	    var inputs = document.querySelectorAll('.animation-panel .left-area input:checked');

	    var uuids = [];
	    inputs.forEach(n => {
	        uuids.push(n.getAttribute('data-uuid'));
	    });

	    if (uuids.length === 0) {
	        UI$1.msg('请勾选需要删除的组！');
	        return;
	    }

	    UI$1.confirm('询问', '删除组会删除组上的所有动画。是否删除？', (event, btn) => {
	        if (btn === 'ok') {
	            uuids.forEach(n => {
	                this.app.editor.animation.removeByUUID(n);
	            });
	            this.updateUI();
	        }
	    });
	};

	// ----------------------------------- 播放器事件 -------------------------------------------

	AnimationPanel$1.prototype.onPlay = function () {
	    if (this.status === PLAY) {
	        return;
	    }
	    this.status = PLAY;

	    UI$1.get('btnPlay', this.id).dom.style.display = 'none';
	    UI$1.get('btnPause', this.id).dom.style.display = '';

	    this.app.on(`animate.${this.id}`, this.onAnimate.bind(this));
	};

	AnimationPanel$1.prototype.onPause = function () {
	    if (this.status === PAUSE) {
	        return;
	    }
	    this.status = PAUSE;

	    UI$1.get('btnPlay', this.id).dom.style.display = '';
	    UI$1.get('btnPause', this.id).dom.style.display = 'none';

	    this.app.on(`animate.${this.id}`, null);
	    this.updateSlider();
	};

	AnimationPanel$1.prototype.onForward = function () {
	    if (this.speed >= 16) {
	        return;
	    }
	    this.speed *= 2;
	};

	AnimationPanel$1.prototype.onBackward = function () {
	    if (this.speed <= 1) {
	        return;
	    }
	    this.speed /= 2;
	};

	AnimationPanel$1.prototype.onStop = function () {
	    if (this.status === STOP) {
	        return;
	    }
	    this.status = STOP;

	    UI$1.get('btnPlay', this.id).dom.style.display = '';
	    UI$1.get('btnPause', this.id).dom.style.display = 'none';

	    this.app.on(`animate.${this.id}`, null);
	    this.sliderLeft = 0;
	    this.updateSlider();
	};

	AnimationPanel$1.prototype.onResetAnimation = function () {
	    this.onStop();
	    this.speed = 4;
	};

	AnimationPanel$1.prototype.onClick = function (event) {
	    if (event.target.data.type === 'AnimationGroup') {
	        return;
	    }
	    this.app.call('tabSelected', this, 'animation');
	    this.app.call('animationSelected', this, event.target.data);
	};

	AnimationPanel$1.prototype.onDblClick = function (event) {
	    var timeline = UI$1.get('timeline', this.id);

	    if (event.target.data && event.target.data.type === 'AnimationGroup') {
	        event.stopPropagation();

	        var animation = new Animation$1({
	            beginTime: event.offsetX / timeline.scale,
	            endTime: (event.offsetX + 80) / timeline.scale
	        });

	        event.target.data.add(animation);

	        this.app.call('animationChanged', this);
	    }
	};

	AnimationPanel$1.prototype.onMouseDown = function () {
	    if (this.isDragging) {
	        return;
	    }
	    this.isDragging = true;
	};

	AnimationPanel$1.prototype.onMouseMove = function () {

	};

	AnimationPanel$1.prototype.onMouseUp = function () {
	    this.isDragging = false;
	};

	// ----------------------- 拖动动画事件 ---------------------------------------------

	AnimationPanel$1.prototype.onDragStartAnimation = function (event) {
	    event.dataTransfer.setData('uuid', event.target.data.uuid);
	    event.dataTransfer.setData('offsetX', event.offsetX);
	};

	AnimationPanel$1.prototype.onDragEndAnimation = function (event) {
	    event.dataTransfer.clearData();
	};

	AnimationPanel$1.prototype.onDragEnterGroup = function (event) {
	    event.preventDefault();
	};

	AnimationPanel$1.prototype.onDragOverGroup = function (event) {
	    event.preventDefault();
	};

	AnimationPanel$1.prototype.onDragLeaveGroup = function (event) {
	    event.preventDefault();
	};

	AnimationPanel$1.prototype.onDropGroup = function (event) {
	    event.preventDefault();
	    var uuid = event.dataTransfer.getData('uuid');
	    var offsetX = event.dataTransfer.getData('offsetX');

	    var groups = this.app.editor.animation.getAnimationGroups();
	    var group = groups.filter(n => n.animations.findIndex(m => m.uuid === uuid) > -1)[0];
	    var animation = group.animations.filter(n => n.uuid === uuid)[0];
	    group.remove(animation);

	    var timeline = UI$1.get('timeline', this.id);
	    var length = animation.endTime - animation.beginTime;
	    animation.beginTime = (event.offsetX - offsetX) / timeline.scale;
	    animation.endTime = animation.beginTime + length;

	    if (event.target.data instanceof Animation$1) { // 拖动到其他动画上
	        event.target.parentElement.data.add(animation);
	    } else { // 拖动到动画组上
	        event.target.data.add(animation);
	    }

	    this.updateUI();
	};

	/**
	 * 模型面板
	 * @author tengge / https://github.com/tengge1
	 */
	function ModelPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	ModelPanel.prototype = Object.create(UI$1.Control.prototype);
	ModelPanel.prototype.constructor = ModelPanel;

	ModelPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            position: 'relative'
	        },
	        children: []
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 纹理面板
	 * @author tengge / https://github.com/tengge1
	 */
	function TexturePanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	TexturePanel.prototype = Object.create(UI$1.Control.prototype);
	TexturePanel.prototype.constructor = TexturePanel;

	TexturePanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            position: 'relative'
	        },
	        children: []
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 纹理面板
	 * @author tengge / https://github.com/tengge1
	 */
	function AudioPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	AudioPanel.prototype = Object.create(UI$1.Control.prototype);
	AudioPanel.prototype.constructor = AudioPanel;

	AudioPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            position: 'relative'
	        },
	        children: []
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 粒子面板
	 * @author tengge / https://github.com/tengge1
	 */
	function ParticlePanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	ParticlePanel.prototype = Object.create(UI$1.Control.prototype);
	ParticlePanel.prototype.constructor = ParticlePanel;

	ParticlePanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            position: 'relative'
	        },
	        children: []
	    };

	    var control = UI$1.create(data);
	    control.render();
	};

	/**
	 * 日志面板
	 * @author tengge / https://github.com/tengge1
	 */
	function LogPanel(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	LogPanel.prototype = Object.create(UI$1.Control.prototype);
	LogPanel.prototype.constructor = LogPanel;

	LogPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'Panel',
	        style: {
	            position: 'relative'
	        },
	        children: [{
	            xtype: 'button',
	            text: '清空',
	            onClick: this.onClearLog.bind(this)
	        }, {
	            xtype: 'br'
	        }, {
	            xtype: 'div',
	            style: {
	                height: '140px',
	                marginTop: '8px',
	                backgroundColor: '#fff',
	                overflowY: 'auto'
	            },
	            id: 'logContent'
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on(`log.${this.id}`, this.onLog.bind(this));
	};

	LogPanel.prototype.onLog = function (content, type) {
	    var dom = UI$1.get('logContent').dom;

	    var date = new Date();
	    var hour = date.getHours();
	    var minute = date.getMinutes();
	    var second = date.getSeconds();

	    hour = hour < 10 ? '0' + hour : hour;
	    minute = minute < 10 ? '0' + minute : minute;
	    second = second < 10 ? '0' + second : second;

	    content = `<span style="font-weight: bold; margin-right: 8px">${hour}:${minute}:${second}</span>${content}`;

	    var box = document.createElement('div');
	    box.innerHTML = content;

	    if (dom.children.length === 0) {
	        dom.appendChild(box);
	    } else {
	        dom.insertBefore(box, dom.children[0]);
	    }

	    if (type === 'warn') {
	        box.style.backgroundColor = '#fffbe5';
	        box.style.color = '#5c3c00';
	    } else if (type === 'error') {
	        box.style.backgroundColor = '#fff0f0';
	        box.style.color = '#ff0000';
	    }
	};

	LogPanel.prototype.onClearLog = function () {
	    var dom = UI$1.get('logContent').dom;
	    dom.innerHTML = '';
	    this.onLog('清空日志');
	};

	/**
	 * 底部面板
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function BottomPanel(options) {
	    Control.call(this, options);
	    this.app = options.app;
	}
	BottomPanel.prototype = Object.create(Control.prototype);
	BottomPanel.prototype.constructor = BottomPanel;

	BottomPanel.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        cls: 'sidebar bottomPanel',
	        parent: this.parent,
	        children: [{
	            xtype: 'div',
	            cls: 'tabs',
	            style: {
	                position: 'sticky',
	                top: 0,
	                zIndex: 20
	            },
	            children: [{
	                xtype: 'text',
	                id: 'animationTab',
	                text: '动画',
	                onClick: () => {
	                    this.selectTab('animation');
	                }
	            }, {
	                xtype: 'text',
	                id: 'modelTab',
	                text: '模型',
	                onClick: () => {
	                    this.selectTab('model');
	                }
	            }, {
	                xtype: 'text',
	                id: 'textureTab',
	                text: '纹理',
	                onClick: () => {
	                    this.selectTab('texture');
	                }
	            }, {
	                xtype: 'text',
	                id: 'audioTab',
	                text: '音频',
	                onClick: () => {
	                    this.selectTab('audio');
	                }
	            }, {
	                xtype: 'text',
	                id: 'particleTab',
	                text: '粒子',
	                onClick: () => {
	                    this.selectTab('particle');
	                }
	            }, {
	                xtype: 'text',
	                id: 'logTab',
	                text: '日志',
	                onClick: () => {
	                    this.selectTab('log');
	                }
	            }]
	        }, {
	            xtype: 'div',
	            id: 'animationPanel',
	            style: {
	                flex: 1
	            },
	            children: [
	                new AnimationPanel$1({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'modelPanel',
	            style: {
	                flex: 1
	            },
	            children: [
	                new ModelPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'texturePanel',
	            style: {
	                flex: 1
	            },
	            children: [
	                new TexturePanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'audioPanel',
	            style: {
	                flex: 1
	            },
	            children: [
	                new AudioPanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'particlePanel',
	            style: {
	                flex: 1
	            },
	            children: [
	                new ParticlePanel({ app: this.app })
	            ]
	        }, {
	            xtype: 'div',
	            id: 'logPanel',
	            children: [
	                new LogPanel({ app: this.app })
	            ]
	        }]
	    };

	    var control = UI.create(data);
	    control.render();

	    this.app.on(`appStarted.${this.id}`, () => {
	        this.selectTab('animation');
	    });
	};

	BottomPanel.prototype.selectTab = function (tabName) {
	    var animationTab = UI.get('animationTab');
	    var modelTab = UI.get('modelTab');
	    var textureTab = UI.get('textureTab');
	    var audioTab = UI.get('audioTab');
	    var particleTab = UI.get('particleTab');
	    var logTab = UI.get('logTab');

	    var animationPanel = UI.get('animationPanel');
	    var modelPanel = UI.get('modelPanel');
	    var texturePanel = UI.get('texturePanel');
	    var audioPanel = UI.get('audioPanel');
	    var particlePanel = UI.get('particlePanel');
	    var logPanel = UI.get('logPanel');

	    animationTab.dom.className = '';
	    modelTab.dom.className = '';
	    textureTab.dom.className = '';
	    audioTab.dom.className = '';
	    particleTab.dom.className = '';
	    logTab.dom.className = '';

	    animationPanel.dom.style.display = 'none';
	    modelPanel.dom.style.display = 'none';
	    texturePanel.dom.style.display = 'none';
	    audioPanel.dom.style.display = 'none';
	    particlePanel.dom.style.display = 'none';
	    logPanel.dom.style.display = 'none';

	    switch (tabName) {
	        case 'animation':
	            animationTab.dom.className = 'selected';
	            animationPanel.dom.style.display = '';
	            break;
	        case 'model':
	            modelTab.dom.className = 'selected';
	            modelPanel.dom.style.display = '';
	            break;
	        case 'texture':
	            textureTab.dom.className = 'selected';
	            texturePanel.dom.style.display = '';
	            break;
	        case 'audio':
	            audioTab.dom.className = 'selected';
	            audioPanel.dom.style.display = '';
	            break;
	        case 'particle':
	            particleTab.dom.className = 'selected';
	            particlePanel.dom.style.display = '';
	            break;
	        case 'log':
	            logTab.dom.className = 'selected';
	            logPanel.dom.style.display = '';
	            break;
	    }
	};

	/**
	 * 状态栏
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function StatusBar(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;
	}
	StatusBar.prototype = Object.create(UI$1.Control.prototype);
	StatusBar.prototype.constructor = StatusBar;

	StatusBar.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        cls: 'statusBar',
	        children: [{
	            xtype: 'row',
	            children: [{
	                xtype: 'label',
	                text: '物体'
	            }, {
	                xtype: 'text',
	                id: 'objectsText',
	                scope: this.id,
	                text: '0' // 物体数
	            }, {
	                xtype: 'label',
	                text: '顶点'
	            }, {
	                xtype: 'text',
	                id: 'verticesText',
	                scope: this.id,
	                text: '0' // 顶点数
	            }, {
	                xtype: 'label',
	                text: '三角形'
	            }, {
	                xtype: 'text',
	                id: 'trianglesText',
	                scope: this.id,
	                text: '0' // 三角形数
	            }]
	        }]
	    };

	    var control = UI$1.create(data);
	    control.render();

	    this.app.on('objectAdded.' + this.id, this.onUpdateInfo.bind(this));
	    this.app.on('objectRemoved.' + this.id, this.onUpdateInfo.bind(this));
	    this.app.on('geometryChanged.' + this.id, this.onUpdateInfo.bind(this));
	};

	StatusBar.prototype.onUpdateInfo = function () {
	    var editor = this.app.editor;

	    var scene = editor.scene;

	    var objects = 0, vertices = 0, triangles = 0;

	    for (var i = 0, l = scene.children.length; i < l; i++) {
	        var object = scene.children[i];

	        object.traverseVisible(function (object) {
	            objects++;

	            if (object instanceof THREE.Mesh) {
	                var geometry = object.geometry;

	                if (geometry instanceof THREE.Geometry) {
	                    vertices += geometry.vertices.length;
	                    triangles += geometry.faces.length;
	                } else if (geometry instanceof THREE.BufferGeometry) {
	                    if (geometry.index !== null) {
	                        vertices += geometry.index.count * 3;
	                        triangles += geometry.index.count;
	                    } else {
	                        vertices += geometry.attributes.position.count;
	                        triangles += geometry.attributes.position.count / 3;
	                    }
	                }
	            }
	        });
	    }

	    var objectsText = UI$1.get('objectsText', this.id);
	    var verticesText = UI$1.get('verticesText', this.id);
	    var trianglesText = UI$1.get('trianglesText', this.id);

	    objectsText.setValue(objects.format());
	    verticesText.setValue(vertices.format());
	    trianglesText.setValue(triangles.format());
	};

	/**
	 * 设置脚本值命令
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 * @param object THREE.Object3D
	 * @param script javascript object
	 * @param attributeName string
	 * @param newValue string, object
	 * @param cursorPosition javascript object with format {line: 2, ch: 3}
	 * @param scrollInfo javascript object with values {left, top, width, height, clientWidth, clientHeight}
	 * @constructor
	 */
	function SetScriptValueCommand(object, script, attributeName, newValue, cursorPosition, scrollInfo) {
		Command.call(this);

		this.type = 'SetScriptValueCommand';
		this.name = '设置脚本.' + attributeName;
		this.updatable = true;

		this.object = object;
		this.script = script;

		this.attributeName = attributeName;
		this.oldValue = (script !== undefined) ? script[this.attributeName] : undefined;
		this.newValue = newValue;
		this.cursorPosition = cursorPosition;
		this.scrollInfo = scrollInfo;
	}
	SetScriptValueCommand.prototype = Object.create(Command.prototype);

	Object.assign(SetScriptValueCommand.prototype, {
		constructor: SetScriptValueCommand,

		execute: function () {
			this.script[this.attributeName] = this.newValue;

			this.editor.app.call('scriptChanged', this);
			this.editor.app.call('refreshScriptEditor', this, this.object, this.script, this.cursorPosition, this.scrollInfo);
		},

		undo: function () {
			this.script[this.attributeName] = this.oldValue;

			this.editor.app.call('scriptChanged', this);
			this.editor.app.call('refreshScriptEditor', this, this.object, this.script, this.cursorPosition, this.scrollInfo);
		},

		update: function (cmd) {
			this.cursorPosition = cmd.cursorPosition;
			this.scrollInfo = cmd.scrollInfo;
			this.newValue = cmd.newValue;
		},

		toJSON: function () {
			var output = Command.prototype.toJSON.call(this);

			output.objectUuid = this.object.uuid;
			output.index = this.editor.scripts[this.object.uuid].indexOf(this.script);
			output.attributeName = this.attributeName;
			output.oldValue = this.oldValue;
			output.newValue = this.newValue;
			output.cursorPosition = this.cursorPosition;
			output.scrollInfo = this.scrollInfo;

			return output;
		},

		fromJSON: function (json) {
			Command.prototype.fromJSON.call(this, json);

			this.oldValue = json.oldValue;
			this.newValue = json.newValue;
			this.attributeName = json.attributeName;
			this.object = this.editor.objectByUuid(json.objectUuid);
			this.script = this.editor.scripts[json.objectUuid][json.index];
			this.cursorPosition = json.cursorPosition;
			this.scrollInfo = json.scrollInfo;
		}
	});

	/**
	 * 脚本编辑器
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function ScriptEditor(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;

	    this.codemirror = null;
	    this.server = null;
	    this.delay = null; // 代码校验延迟函数
	    this.delayTime = 1000; // 代码校验间隔时间（毫秒）

	    this.uuid = null;
	    this.name = null;
	    this.mode = null;
	    this.source = null;
	    this.title = null;

	    this.errorLines = []; // 代码错误行数
	    this.widgets = [];

	    this.callback = null;
	}
	ScriptEditor.prototype = Object.create(UI$1.Control.prototype);
	ScriptEditor.prototype.constructor = ScriptEditor;

	ScriptEditor.prototype.render = function () {
	    var data = {
	        xtype: 'div',
	        parent: this.parent,
	        id: 'scriptEditor',
	        cls: 'script',
	        style: {
	            backgroundColor: '#272822',
	            display: 'none'
	        },
	        children: [{
	            xtype: 'div',
	            style: {
	                padding: '10px'
	            },
	            children: [{
	                xtype: 'text',
	                id: 'scriptTitle',
	                style: {
	                    color: '#fff'
	                }
	            }, {
	                xtype: 'closebutton',
	                style: {
	                    position: 'absolute',
	                    top: '3px',
	                    right: '1px',
	                    cursor: 'pointer'
	                },
	                onClick: this.hide.bind(this)
	            }]
	        }]
	    };

	    var container = UI$1.create(data);
	    container.render();

	    // 绑定事件
	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	};

	/**
	 * 打开脚本文件
	 * @param {*} uuid 脚本uuid
	 * @param {*} name 名称
	 * @param {*} mode 类型 javascript、vertexShader、fragmentShader、json 默认：javascript
	 * @param {*} source 源码 文件初始代码 默认：空
	 * @param {*} title 标题 文件标题 默认：未命名.${文件类型}
	 * @param {*} callback 回调函数
	 */
	ScriptEditor.prototype.open = function (uuid, name, mode, source, title, callback) {
	    var scriptTitle = UI$1.get('scriptTitle');

	    // 连续打开脚本时，自动保存上次打开的文件
	    if (this.uuid != null) {
	        this.save();
	        this.uuid = null;
	        this.name = null;
	        this.mode = null;
	        this.source = null;
	        this.title = null;
	    }

	    // 打开新文件
	    name = name || '未命名';
	    mode = mode || 'javascript';
	    source = source || '';
	    title = title || '未命名';
	    title = `${title}.${(mode === 'vertexShader' || mode === 'fragmentShader') ? '.glsl' : (mode === 'json' ? '.json' : '.js')}`;

	    this.uuid = uuid;
	    this.name = name;
	    this.mode = mode;
	    this.source = source;
	    this.title = title;
	    this.callback = callback;

	    this.show();

	    scriptTitle.setValue(title);

	    this.codemirror.setValue(source);

	    // 设置codemirror模式
	    if (mode === 'json') {
	        this.codemirror.setOption('mode', {
	            name: 'javascript',
	            json: true
	        });
	    } if (mode === 'vertexShader' || mode === 'fragmentShader') {
	        this.codemirror.setOption('mode', 'glsl');
	    } else {
	        this.codemirror.setOption('mode', mode);
	    }
	    this.codemirror.focus();
	    this.codemirror.setCursor({
	        line: 0,
	        ch: 0
	    });
	};

	/**
	 * 显示脚本编辑器
	 */
	ScriptEditor.prototype.show = function () {
	    var container = UI$1.get('scriptEditor');

	    container.dom.style.display = 'block';
	};

	/**
	 * 隐藏脚本编辑器
	 */
	ScriptEditor.prototype.hide = function () {
	    var container = UI$1.get('scriptEditor');

	    this.save();
	    container.dom.style.display = 'none';

	    this.uuid = null;
	    this.name = null;
	    this.mode = null;
	    this.source = null;
	    this.title = null;
	};

	/**
	 * 保存脚本
	 */
	ScriptEditor.prototype.save = function () {
	    var value = this.codemirror.getValue();

	    if (typeof (this.callback) === 'function') {
	        this.callback.call(this, value);
	    }

	    this.app.log(`${this.uuid}脚本保存成功！`);
	};

	/**
	 * 刷新脚本编辑器
	 * @param {*} title 标题
	 * @param {*} source 代码
	 * @param {*} cursorPosition 光标位置
	 * @param {*} scrollInfo 滚动信息
	 */
	ScriptEditor.prototype.refresh = function (title, source, cursorPosition, scrollInfo) {
	    var container = UI$1.get('scriptEditor');
	    var title = UI$1.get('scriptTitle');

	    // 复制codemirror的历史记录，因为"codemirror.setValue(...)"函数会改变它的历史。
	    var history = this.codemirror.getHistory();
	    title.setValue(title);
	    this.codemirror.setValue(source);

	    if (cursorPosition !== undefined) {
	        this.codemirror.setCursor(cursorPosition);
	        this.codemirror.scrollTo(scrollInfo.left, scrollInfo.top);
	    }

	    this.codemirror.setHistory(history); // 设置历史到先前状态
	};

	// 内部方法

	ScriptEditor.prototype.onAppStarted = function () {
	    var container = UI$1.get('scriptEditor');

	    var codemirror = CodeMirror(container.dom, {
	        value: '',
	        lineNumbers: true,
	        matchBrackets: true,
	        indentWithTabs: true,
	        tabSize: 4,
	        indentUnit: 4,
	        hintOptions: {
	            completeSingle: false
	        }
	    });

	    codemirror.setOption('theme', 'monokai');
	    codemirror.on('change', this.onCodeMirrorChange.bind(this));

	    // 防止回退键删除物体
	    var wrapper = codemirror.getWrapperElement();
	    wrapper.addEventListener('keydown', event => {
	        event.stopPropagation();
	    });

	    // tern js 自动完成
	    var server = new CodeMirror.TernServer({
	        caseInsensitive: true,
	        plugins: { threejs: null }
	    });

	    // 快捷键
	    codemirror.setOption('extraKeys', {
	        'Ctrl-Space': cm => { server.complete(cm); },
	        'Ctrl-I': cm => { server.showType(cm); },
	        'Ctrl-O': cm => { server.showDocs(cm); },
	        'Alt-.': cm => { server.jumpToDef(cm); },
	        'Alt-,': cm => { server.jumpBack(cm); },
	        'Ctrl-Q': cm => { server.rename(cm); },
	        'Ctrl-.': cm => { server.selectName(cm); }
	    });

	    codemirror.on('cursorActivity', cm => {
	        if (this.mode !== 'javascript') {
	            return;
	        }
	        server.updateArgHints(cm);
	    });

	    codemirror.on('keypress', (cm, kb) => {
	        if (this.mode !== 'javascript') {
	            return;
	        }
	        var typed = String.fromCharCode(kb.which || kb.keyCode);
	        if (/[\w\.]/.exec(typed)) {
	            server.complete(cm);
	        }
	    });

	    this.codemirror = codemirror;
	    this.server = server;
	};

	/**
	 * 代码修改事件
	 */
	ScriptEditor.prototype.onCodeMirrorChange = function () {
	    if (this.codemirror.state.focused === false) {
	        return;
	    }

	    if (this.delay) {
	        clearTimeout(this.delay);
	    }

	    this.delay = setTimeout(() => {
	        var code = this.codemirror.getValue();
	        this.validate(code);
	    }, this.delayTime);
	};

	/**
	 * 校验编辑器中代码正确性
	 * @param {*} string 
	 */
	ScriptEditor.prototype.validate = function (string) {
	    var codemirror = this.codemirror;
	    var mode = this.mode;

	    var errorLines = this.errorLines;
	    var widgets = this.widgets;

	    var errors = [];

	    return codemirror.operation(() => {
	        while (errorLines.length > 0) {
	            codemirror.removeLineClass(errorLines.shift(), 'background', 'errorLine');
	        }

	        while (widgets.length > 0) {
	            codemirror.removeLineWidget(widgets.shift());
	        }

	        switch (mode) {
	            case 'javascript':
	                try {
	                    var syntax = esprima.parse(string, { tolerant: true });
	                    errors = syntax.errors;
	                } catch (error) {
	                    errors.push({
	                        lineNumber: error.lineNumber - 1,
	                        message: error.message
	                    });
	                }

	                for (var i = 0; i < errors.length; i++) {
	                    var error = errors[i];
	                    error.message = error.message.replace(/Line [0-9]+: /, '');
	                }
	                break;
	            case 'json':
	                jsonlint.parseError = (message, info) => {
	                    message = message.split('\n')[3];
	                    errors.push({
	                        lineNumber: info.loc.first_line - 1,
	                        message: message
	                    });
	                };

	                try {
	                    jsonlint.parse(string);
	                } catch (error) {
	                    // ignore failed error recovery
	                }
	                break;
	            case 'vertexShader':
	            case 'fragmentShader':
	                try {
	                    var shaderType = mode === 'vertexShader' ? glslprep.Shader.VERTEX : glslprep.Shader.FRAGMENT;
	                    glslprep.parseGlsl(string, shaderType);
	                } catch (error) {
	                    if (error instanceof glslprep.SyntaxError) {
	                        errors.push({
	                            lineNumber: error.line,
	                            message: "Syntax Error: " + error.message
	                        });
	                    } else {
	                        console.error(error.stack || error);
	                    }
	                }
	        }

	        for (var i = 0; i < errors.length; i++) {
	            var error = errors[i];

	            var message = document.createElement('div');
	            message.className = 'esprima-error';
	            message.textContent = error.message;

	            var lineNumber = Math.max(error.lineNumber, 0);
	            errorLines.push(lineNumber);

	            codemirror.addLineClass(lineNumber, 'background', 'errorLine');

	            var widget = codemirror.addLineWidget(lineNumber, message);
	            widgets.push(widget);
	        }

	        return errors.length === 0;
	    });
	};

	var ID$7 = -1;

	/**
	 * 播放器组件
	 * @param {*} app 应用
	 */
	function PlayerComponent(app) {
	    this.id = `PlayerComponent${ID$7--}`;
	    this.app = app;
	}

	/**
	 * 创建
	 * @param {*} scene 
	 * @param {*} camera 
	 * @param {*} renderer 
	 * @param {*} others 
	 */
	PlayerComponent.prototype.create = function (scene, camera, renderer, others) {

	};

	/**
	 * 更新
	 * @param {*} clock 
	 * @param {*} deltaTime 
	 */
	PlayerComponent.prototype.update = function (clock, deltaTime) {

	};

	/**
	 * 析构
	 * @param {*} scene 
	 * @param {*} camera 
	 * @param {*} renderer 
	 * @param {*} others 
	 */
	PlayerComponent.prototype.dispose = function (scene, camera, renderer, others) {

	};

	/**
	 * 播放器事件
	 * @param {*} app 应用
	 */
	function PlayerLoader(app) {
	    PlayerComponent.call(this, app);

	    this.assets = {};
	}

	PlayerLoader.prototype = Object.create(PlayerComponent.prototype);
	PlayerLoader.prototype.constructor = PlayerLoader;

	PlayerLoader.prototype.create = function (jsons) {
	    var promise = (new Converter()).fromJson(jsons, {
	        server: this.app.options.server
	    });

	    return new Promise(resolve => {
	        promise.then(obj => {
	            this.scene = obj.scene || new THREE.Scene();
	            this.load().then(() => {
	                resolve(obj);
	            });
	        });
	    });
	};

	PlayerLoader.prototype.load = function () {
	    this.assets = {};
	    var promises = [];

	    this.scene.traverse(n => {
	        if (n instanceof THREE.Audio) {
	            promises.push(new Promise(resolve => {
	                var loader = new THREE.AudioLoader();

	                loader.load(this.app.options.server + n.userData.Url, buffer => {
	                    this.assets[n.userData.Url] = buffer;
	                    resolve();
	                }, undefined, () => {
	                    this.app.error(`PlayerLoader: ${n.userData.Url}下载失败。`);
	                    resolve();
	                });
	            }));
	        }
	    });

	    if (promises.length > 0) {
	        return Promise.all(promises);
	    } else {
	        return new Promise(resolve => {
	            resolve();
	        });
	    }
	};

	PlayerLoader.prototype.getAsset = function (url) {
	    return this.assets[url];
	};

	PlayerLoader.prototype.dispose = function () {
	    this.assets = {};
	    this.scene = null;
	};

	/**
	 * 播放器事件
	 * @param {*} app 应用
	 */
	function PlayerEvent(app) {
	    PlayerComponent.call(this, app);
	}

	PlayerEvent.prototype = Object.create(PlayerComponent.prototype);
	PlayerEvent.prototype.constructor = PlayerEvent;

	PlayerEvent.prototype.create = function (scene, camera, renderer, scripts) {
	    this.scene = scene;
	    this.camera = camera;
	    this.renderer = renderer;
	    this.scripts = scripts;

	    var dom = renderer.domElement;

	    this.events = Object.keys(scripts).map(uuid => {
	        var script = scripts[uuid];
	        return (new Function(
	            'scene',
	            'camera',
	            'renderer',
	            script.source + `
            var init = init || null;
            var start = start || null;
            var update = update || null;
            var stop = stop || null;
            var onClick = onClick || null;
            var onDblClick = onDblClick || null;
            var onKeyDown = onKeyDown || null;
            var onKeyUp = onKeyUp || null;
            var onMouseDown = onMouseDown || null;
            var onMouseMove = onMouseMove || null;
            var onMouseUp = onMouseUp || null;
            var onMouseWheel = onMouseWheel || null;
            var onResize = onResize || null;
            return { init, start, update, stop, onClick, onDblClick, onKeyDown, onKeyUp, onMouseDown, onMouseMove, onMouseUp, onMouseWheel, onResize };
            `
	        )).call(scene, scene, camera, renderer);
	    });

	    this.events.forEach(n => {
	        if (typeof (n.onClick) === 'function') {
	            dom.addEventListener('click', n.onClick.bind(this.scene));
	        }
	        if (typeof (n.onDblClick) === 'function') {
	            dom.addEventListener('dblclick', n.onDblClick.bind(this.scene));
	        }
	        if (typeof (n.onKeyDown) === 'function') {
	            dom.addEventListener('keydown', n.onKeyDown.bind(this.scene));
	        }
	        if (typeof (n.onKeyUp) === 'function') {
	            dom.addEventListener('keyup', n.onKeyUp.bind(this.scene));
	        }
	        if (typeof (n.onMouseDown) === 'function') {
	            dom.addEventListener('mousedown', n.onMouseDown.bind(this.scene));
	        }
	        if (typeof (n.onMouseMove) === 'function') {
	            dom.addEventListener('mousemove', n.onMouseMove.bind(this.scene));
	        }
	        if (typeof (n.onMouseUp) === 'function') {
	            dom.addEventListener('mouseup', n.onMouseUp.bind(this.scene));
	        }
	        if (typeof (n.onMouseWheel) === 'function') {
	            dom.addEventListener('mousewheel', n.onMouseWheel.bind(this.scene));
	        }
	        if (typeof (n.onResize) === 'function') {
	            window.addEventListener('resize', n.onResize.bind(this.scene));
	        }
	    });
	};

	/**
	 * 场景载入前执行一次
	 */
	PlayerEvent.prototype.init = function () {
	    this.events.forEach(n => {
	        if (typeof (n.init) === 'function') {
	            n.init();
	        }
	    });
	};

	/**
	 * 场景载入后执行一次
	 */
	PlayerEvent.prototype.start = function () {
	    this.events.forEach(n => {
	        if (typeof (n.start) === 'function') {
	            n.start();
	        }
	    });
	};

	/**
	 * 运行期间每帧都要执行
	 * @param {*} clock 
	 * @param {*} deltaTime 
	 */
	PlayerEvent.prototype.update = function (clock, deltaTime) {
	    this.events.forEach(n => {
	        if (typeof (n.update) === 'function') {
	            n.update(clock, deltaTime);
	        }
	    });
	};

	/**
	 * 程序结束运行后执行一次
	 */
	PlayerEvent.prototype.stop = function () {
	    this.events.forEach(n => {
	        if (typeof (n.stop) === 'function') {
	            n.stop();
	        }
	    });
	};

	/**
	 * 析构PlayerEvent
	 */
	PlayerEvent.prototype.dispose = function () {
	    var dom = this.renderer.domElement;

	    this.events.forEach(n => {
	        if (typeof (n.onClick) === 'function') {
	            dom.removeEventListener('click', n.onClick.bind(this.scene));
	        }
	        if (typeof (n.onDblClick) === 'function') {
	            dom.removeEventListener('dblclick', n.onDblClick.bind(this.scene));
	        }
	        if (typeof (n.onKeyDown) === 'function') {
	            dom.removeEventListener('keydown', n.onKeyDown.bind(this.scene));
	        }
	        if (typeof (n.onKeyUp) === 'function') {
	            dom.removeEventListener('keyup', n.onKeyUp.bind(this.scene));
	        }
	        if (typeof (n.onMouseDown) === 'function') {
	            dom.removeEventListener('mousedown', n.onMouseDown.bind(this.scene));
	        }
	        if (typeof (n.onMouseMove) === 'function') {
	            dom.removeEventListener('mousemove', n.onMouseMove.bind(this.scene));
	        }
	        if (typeof (n.onMouseUp) === 'function') {
	            dom.removeEventListener('mouseup', n.onMouseUp.bind(this.scene));
	        }
	        if (typeof (n.onMouseWheel) === 'function') {
	            dom.removeEventListener('mousewheel', n.onMouseWheel.bind(this.scene));
	        }
	        if (typeof (n.onResize) === 'function') {
	            window.removeEventListener('resize', n.onResize.bind(this.scene));
	        }
	    });

	    this.scene = null;
	    this.camera = null;
	    this.renderer = null;
	    this.scripts = null;
	    this.events.length = 0;
	};

	/**
	 * 播放器音频
	 * @param {*} app 应用
	 */
	function PlayerAudio(app) {
	    PlayerComponent.call(this, app);

	    this.audios = [];
	}

	PlayerAudio.prototype = Object.create(PlayerComponent.prototype);
	PlayerAudio.prototype.constructor = PlayerAudio;

	PlayerAudio.prototype.create = function (scene, camera, renderer, loader) {
	    this.audios = [];

	    scene.traverse(n => {
	        if (n instanceof THREE.Audio) {
	            var buffer = loader.getAsset(n.userData.Url);

	            if (buffer === undefined) {
	                this.app.error(`PlayerAudio: 加载背景音乐失败。`);
	                return;
	            }

	            n.setBuffer(buffer);

	            if (n.userData.autoplay) {
	                n.autoplay = n.userData.autoplay;
	                n.play();
	            }

	            this.audios.push(n);
	        }
	    });
	};

	PlayerAudio.prototype.dispose = function () {
	    this.audios.forEach(n => {
	        if (n.isPlaying) {
	            n.stop();
	        }
	    });

	    this.audios.length = 0;
	};

	/*
	* Ease
	* Visit http://createjs.com/ for documentation, updates and examples.
	*
	* Copyright (c) 2010 gskinner.com, inc.
	*
	* Permission is hereby granted, free of charge, to any person
	* obtaining a copy of this software and associated documentation
	* files (the "Software"), to deal in the Software without
	* restriction, including without limitation the rights to use,
	* copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the
	* Software is furnished to do so, subject to the following
	* conditions:
	*
	* The above copyright notice and this permission notice shall be
	* included in all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	* OTHER DEALINGS IN THE SOFTWARE.
	*/

	/**
	 * @module TweenJS
	 * @author tweenjs / https://www.createjs.com/tweenjs
	 * @link https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
	 */

	/**
	 * The Ease class provides a collection of easing functions for use with TweenJS. It does not use the standard 4 param
	 * easing signature. Instead it uses a single param which indicates the current linear ratio (0 to 1) of the tween.
	 *
	 * Most methods on Ease can be passed directly as easing functions:
	 *
	 *      createjs.Tween.get(target).to({x:100}, 500, createjs.Ease.linear);
	 *
	 * However, methods beginning with "get" will return an easing function based on parameter values:
	 *
	 *      createjs.Tween.get(target).to({y:200}, 500, createjs.Ease.getPowIn(2.2));
	 *
	 * Please see the <a href="http://www.createjs.com/Demos/TweenJS/Tween_SparkTable">spark table demo</a> for an
	 * overview of the different ease types on <a href="http://tweenjs.com">TweenJS.com</a>.
	 *
	 * <em>Equations derived from work by Robert Penner.</em>
	 * @class Ease
	 * @static
	 **/
	function Ease() {
		throw "Ease cannot be instantiated.";
	}


	// static methods and properties
	/**
	 * @method linear
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.linear = function (t) { return t; };

	/**
	 * Identical to linear.
	 * @method none
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.none = Ease.linear;

	/**
	 * Mimics the simple -100 to 100 easing in Adobe Flash/Animate.
	 * @method get
	 * @param {Number} amount A value from -1 (ease in) to 1 (ease out) indicating the strength and direction of the ease.
	 * @static
	 * @return {Function}
	 **/
	Ease.get = function (amount) {
		if (amount < -1) { amount = -1; }
		else if (amount > 1) { amount = 1; }
		return function (t) {
			if (amount == 0) { return t; }
			if (amount < 0) { return t * (t * -amount + 1 + amount); }
			return t * ((2 - t) * amount + (1 - amount));
		};
	};

	/**
	 * Configurable exponential ease.
	 * @method getPowIn
	 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
	 * @static
	 * @return {Function}
	 **/
	Ease.getPowIn = function (pow) {
		return function (t) {
			return Math.pow(t, pow);
		};
	};

	/**
	 * Configurable exponential ease.
	 * @method getPowOut
	 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
	 * @static
	 * @return {Function}
	 **/
	Ease.getPowOut = function (pow) {
		return function (t) {
			return 1 - Math.pow(1 - t, pow);
		};
	};

	/**
	 * Configurable exponential ease.
	 * @method getPowInOut
	 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
	 * @static
	 * @return {Function}
	 **/
	Ease.getPowInOut = function (pow) {
		return function (t) {
			if ((t *= 2) < 1) return 0.5 * Math.pow(t, pow);
			return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
		};
	};

	/**
	 * @method quadIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quadIn = Ease.getPowIn(2);
	/**
	 * @method quadOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quadOut = Ease.getPowOut(2);
	/**
	 * @method quadInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quadInOut = Ease.getPowInOut(2);

	/**
	 * @method cubicIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.cubicIn = Ease.getPowIn(3);
	/**
	 * @method cubicOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.cubicOut = Ease.getPowOut(3);
	/**
	 * @method cubicInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.cubicInOut = Ease.getPowInOut(3);

	/**
	 * @method quartIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quartIn = Ease.getPowIn(4);
	/**
	 * @method quartOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quartOut = Ease.getPowOut(4);
	/**
	 * @method quartInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quartInOut = Ease.getPowInOut(4);

	/**
	 * @method quintIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quintIn = Ease.getPowIn(5);
	/**
	 * @method quintOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quintOut = Ease.getPowOut(5);
	/**
	 * @method quintInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.quintInOut = Ease.getPowInOut(5);

	/**
	 * @method sineIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.sineIn = function (t) {
		return 1 - Math.cos(t * Math.PI / 2);
	};

	/**
	 * @method sineOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.sineOut = function (t) {
		return Math.sin(t * Math.PI / 2);
	};

	/**
	 * @method sineInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.sineInOut = function (t) {
		return -0.5 * (Math.cos(Math.PI * t) - 1);
	};

	/**
	 * Configurable "back in" ease.
	 * @method getBackIn
	 * @param {Number} amount The strength of the ease.
	 * @static
	 * @return {Function}
	 **/
	Ease.getBackIn = function (amount) {
		return function (t) {
			return t * t * ((amount + 1) * t - amount);
		};
	};
	/**
	 * @method backIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.backIn = Ease.getBackIn(1.7);

	/**
	 * Configurable "back out" ease.
	 * @method getBackOut
	 * @param {Number} amount The strength of the ease.
	 * @static
	 * @return {Function}
	 **/
	Ease.getBackOut = function (amount) {
		return function (t) {
			return (--t * t * ((amount + 1) * t + amount) + 1);
		};
	};
	/**
	 * @method backOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.backOut = Ease.getBackOut(1.7);

	/**
	 * Configurable "back in out" ease.
	 * @method getBackInOut
	 * @param {Number} amount The strength of the ease.
	 * @static
	 * @return {Function}
	 **/
	Ease.getBackInOut = function (amount) {
		amount *= 1.525;
		return function (t) {
			if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
			return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
		};
	};
	/**
	 * @method backInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.backInOut = Ease.getBackInOut(1.7);

	/**
	 * @method circIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.circIn = function (t) {
		return -(Math.sqrt(1 - t * t) - 1);
	};

	/**
	 * @method circOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.circOut = function (t) {
		return Math.sqrt(1 - (--t) * t);
	};

	/**
	 * @method circInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.circInOut = function (t) {
		if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	};

	/**
	 * @method bounceIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.bounceIn = function (t) {
		return 1 - Ease.bounceOut(1 - t);
	};

	/**
	 * @method bounceOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.bounceOut = function (t) {
		if (t < 1 / 2.75) {
			return (7.5625 * t * t);
		} else if (t < 2 / 2.75) {
			return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
		} else if (t < 2.5 / 2.75) {
			return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
		} else {
			return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
		}
	};

	/**
	 * @method bounceInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.bounceInOut = function (t) {
		if (t < 0.5) return Ease.bounceIn(t * 2) * .5;
		return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
	};

	/**
	 * Configurable elastic ease.
	 * @method getElasticIn
	 * @param {Number} amplitude
	 * @param {Number} period
	 * @static
	 * @return {Function}
	 **/
	Ease.getElasticIn = function (amplitude, period) {
		var pi2 = Math.PI * 2;
		return function (t) {
			if (t == 0 || t == 1) return t;
			var s = period / pi2 * Math.asin(1 / amplitude);
			return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
		};
	};
	/**
	 * @method elasticIn
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.elasticIn = Ease.getElasticIn(1, 0.3);

	/**
	 * Configurable elastic ease.
	 * @method getElasticOut
	 * @param {Number} amplitude
	 * @param {Number} period
	 * @static
	 * @return {Function}
	 **/
	Ease.getElasticOut = function (amplitude, period) {
		var pi2 = Math.PI * 2;
		return function (t) {
			if (t == 0 || t == 1) return t;
			var s = period / pi2 * Math.asin(1 / amplitude);
			return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
		};
	};
	/**
	 * @method elasticOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.elasticOut = Ease.getElasticOut(1, 0.3);

	/**
	 * Configurable elastic ease.
	 * @method getElasticInOut
	 * @param {Number} amplitude
	 * @param {Number} period
	 * @static
	 * @return {Function}
	 **/
	Ease.getElasticInOut = function (amplitude, period) {
		var pi2 = Math.PI * 2;
		return function (t) {
			var s = period / pi2 * Math.asin(1 / amplitude);
			if ((t *= 2) < 1) return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
			return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
		};
	};
	/**
	 * @method elasticInOut
	 * @param {Number} t
	 * @static
	 * @return {Number}
	 **/
	Ease.elasticInOut = Ease.getElasticInOut(1, 0.3 * 1.5);

	/**
	 * 补间动画控制器
	 * @param {*} app 应用
	 */
	function TweenAnimator(app) {
	    PlayerComponent.call(this, app);
	}

	TweenAnimator.prototype = Object.create(PlayerComponent.prototype);
	TweenAnimator.prototype.constructor = TweenAnimator;

	TweenAnimator.prototype.create = function (scene, camera, renderer, animations) {
	    this.scene = scene;
	    this.animations = animations;
	};

	TweenAnimator.prototype.update = function (clock, deltaTime, time) {
	    this.animations.forEach(n => {
	        n.animations.forEach(m => {
	            this.tweenObject(m, time);
	        });
	    });
	};

	TweenAnimator.prototype.tweenObject = function (animation, time) {
	    // 条件判断
	    if (animation.type !== 'Tween' || time < animation.beginTime || time > animation.endTime || animation.target == null) {
	        return;
	    }

	    // 获取对象
	    var target = this.scene.getObjectByProperty('uuid', animation.target);
	    if (target == null) {
	        console.warn(`Player: 场景中不存在uuid为${animation.target}的物体。`);
	        return;
	    }

	    // 获取插值函数
	    var ease = Ease[animation.ease];
	    if (ease == null) {
	        console.warn(`Player: 不存在名称为${animation.ease}的插值函数。`);
	        return;
	    }

	    var result = ease((time - animation.beginTime) / (animation.endTime - animation.beginTime));

	    var positionX = animation.beginPositionX + (animation.endPositionX - animation.beginPositionX) * result;
	    var positionY = animation.beginPositionY + (animation.endPositionY - animation.beginPositionY) * result;
	    var positionZ = animation.beginPositionZ + (animation.endPositionZ - animation.beginPositionZ) * result;

	    var rotationX = animation.beginRotationX + (animation.endRotationX - animation.beginRotationX) * result;
	    var rotationY = animation.beginRotationY + (animation.endRotationY - animation.beginRotationY) * result;
	    var rotationZ = animation.beginRotationZ + (animation.endRotationZ - animation.beginRotationZ) * result;

	    var scaleX = animation.beginScaleX + (animation.endScaleX - animation.beginScaleX) * result;
	    var scaleY = animation.beginScaleY + (animation.endScaleY - animation.beginScaleY) * result;
	    var scaleZ = animation.beginScaleZ + (animation.endScaleZ - animation.beginScaleZ) * result;

	    target.position.x = positionX;
	    target.position.y = positionY;
	    target.position.z = positionZ;

	    target.rotation.x = rotationX;
	    target.rotation.y = rotationY;
	    target.rotation.z = rotationZ;

	    target.scale.x = scaleX;
	    target.scale.y = scaleY;
	    target.scale.z = scaleZ;
	};

	TweenAnimator.prototype.dispose = function () {
	    this.scene = null;
	    this.animations = null;
	};

	/**
	 * MMD动画控制器
	 * @param {*} app 应用
	 */
	function MMDAnimator(app) {
	    PlayerComponent.call(this, app);

	    this.helper = new THREE.MMDHelper();
	}

	MMDAnimator.prototype = Object.create(PlayerComponent.prototype);
	MMDAnimator.prototype.constructor = MMDAnimator;

	MMDAnimator.prototype.create = function (scene, camera, renderer, animations) {
	    scene.traverse(n => {
	        if (n instanceof THREE.SkinnedMesh && (n.userData.Type === 'pmd' || n.userData.Type === 'pmx')) {
	            this.helper.add(n);
	            this.helper.setAnimation(n);
	            this.helper.setPhysics(n);
	            this.helper.unifyAnimationDuration();
	        }
	    });
	};

	MMDAnimator.prototype.update = function (clock, deltaTime) {
	    this.helper.animate(deltaTime);
	};

	MMDAnimator.prototype.dispose = function () {
	    this.helper.meshes.length = 0;
	};

	/**
	 * 粒子动画控制器
	 * @param {*} app 应用
	 */
	function ParticleAnimator(app) {
	    PlayerComponent.call(this, app);
	}

	ParticleAnimator.prototype = Object.create(PlayerComponent.prototype);
	ParticleAnimator.prototype.constructor = ParticleAnimator;

	ParticleAnimator.prototype.create = function (scene, camera, renderer) {
	    this.scene = scene;
	};

	ParticleAnimator.prototype.update = function (clock, deltaTime, time) {
	    var elapsed = clock.getElapsedTime();

	    this.scene.children.forEach(n => {
	        if (n.userData.type === 'Fire') {
	            n.userData.fire.update(elapsed);
	        } else if (n.userData.type === 'Smoke') {
	            n.update(elapsed);
	        } if (n.userData.type === 'ParticleEmitter') {
	            n.userData.group.tick(deltaTime);
	        }
	    });
	};

	ParticleAnimator.prototype.dispose = function () {
	    this.scene = null;
	};

	/**
	 * 播放器动画
	 * @param {*} app 应用
	 */
	function PlayerAnimation(app) {
	    PlayerComponent.call(this, app);

	    this.maxTime = 0; // 最大动画时间（单位：秒）
	    this.currentTime = 0; // 当前动画时间（单位：秒）
	    this.animations = null;

	    this.animators = [
	        new TweenAnimator(this.app),
	        new MMDAnimator(this.app),
	        new ParticleAnimator(this.app)
	    ];
	}

	PlayerAnimation.prototype = Object.create(PlayerComponent.prototype);
	PlayerAnimation.prototype.constructor = PlayerAnimation;

	PlayerAnimation.prototype.create = function (scene, camera, renderer, animations) {
	    this.maxTime = 0;
	    this.currentTime = 0;
	    this.scene = scene;
	    this.camera = camera;
	    this.renderer = renderer;
	    this.animations = animations;

	    this.maxTime = this.calculateMaxTime();

	    this.animators.forEach(n => {
	        n.create(scene, camera, renderer, animations);
	    });

	    this.app.call(`resetAnimation`, this);
	    this.app.call(`startAnimation`, this);
	    this.app.on(`animationTime.${this.id}`, this.updateTime.bind(this));
	};

	PlayerAnimation.prototype.calculateMaxTime = function () {
	    var maxTime = 0;

	    this.animations.forEach(n => {
	        n.animations.forEach(m => {
	            if (m.endTime > maxTime) {
	                maxTime = m.endTime;
	            }
	        });
	    });

	    return maxTime;
	};

	PlayerAnimation.prototype.updateTime = function (time) {
	    this.currentTime = time;
	};

	PlayerAnimation.prototype.update = function (clock, deltaTime) {
	    this.animators.forEach(n => {
	        n.update(clock, deltaTime, this.currentTime);
	    });

	    // 超过最大动画时间，重置动画
	    if (this.currentTime > this.maxTime) {
	        this.app.call(`resetAnimation`, this.id);
	        this.app.call(`startAnimation`, this.id);
	    }
	};

	PlayerAnimation.prototype.dispose = function () {
	    this.maxTime = 0;
	    this.currentTime = 0;
	    this.scene = null;
	    this.camera = null;
	    this.renderer = null;
	    this.animations = null;

	    this.animators.forEach(n => {
	        n.dispose();
	    });

	    this.app.on(`animationTime.${this.id}`, null);
	    this.app.call(`resetAnimation`, this);
	};

	/**
	 * 播放器物理
	 * @param {*} app 应用
	 */
	function PlayerPhysics(app) {
	    PlayerComponent.call(this, app);

	    // 各种参数
	    var gravityConstant = -9.8; // 重力常数
	    this.margin = 0.05; // 两个物体之间最小间距

	    // 物理环境配置
	    var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration(); // 软体刚体碰撞配置
	    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration); // 碰撞调度器
	    var broadphase = new Ammo.btDbvtBroadphase(); // dbvt粗测
	    var solver = new Ammo.btSequentialImpulseConstraintSolver(); // 顺序脉冲约束求解器
	    var softBodySolver = new Ammo.btDefaultSoftBodySolver(); // 默认软体求解器

	    this.world = new Ammo.btSoftRigidDynamicsWorld(
	        dispatcher,
	        broadphase,
	        solver,
	        collisionConfiguration,
	        softBodySolver
	    );

	    var gravity = new Ammo.btVector3(0, gravityConstant, 0);
	    this.world.setGravity(gravity);
	    this.world.getWorldInfo().set_m_gravity(gravity);

	    this.transformAux1 = new Ammo.btTransform();
	    this.rigidBodies = [];
	}

	PlayerPhysics.prototype = Object.create(PlayerComponent.prototype);
	PlayerPhysics.prototype.constructor = PlayerPhysics;

	PlayerPhysics.prototype.create = function (scene, camera, renderer) {
	    this.scene = scene;

	    this.scene.traverse(n => {
	        if (n.userData && n.userData.physics) {
	            var body = PlysicsUtils.createRigidBody(n, this.margin);
	            if (body) {
	                n.userData.physics.body = body;
	                this.world.addRigidBody(body);

	                if (n.userData.physics.mass > 0) {
	                    this.rigidBodies.push(n);
	                    body.setActivationState(4);
	                }
	            }
	        }
	    });
	};

	PlayerPhysics.prototype.update = function (clock, deltaTime) {
	    var rigidBodies = this.rigidBodies;

	    this.world.stepSimulation(deltaTime, 100);

	    for (var i = 0, l = rigidBodies.length; i < l; i++) {
	        var objThree = rigidBodies[i];
	        var objPhys = objThree.userData.physics.body;
	        if (!objPhys) {
	            continue;
	        }
	        var ms = objPhys.getMotionState();
	        if (ms) {
	            ms.getWorldTransform(this.transformAux1);
	            var p = this.transformAux1.getOrigin();
	            var q = this.transformAux1.getRotation();
	            objThree.position.set(p.x(), p.y(), p.z());
	            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
	        }
	    }
	};

	PlayerPhysics.prototype.dispose = function () {
	    this.rigidBodies.forEach(n => {
	        var body = n.userData.physics.body;
	        this.world.removeRigidBody(body);
	    });

	    this.rigidBodies.length = 0;

	    this.scene.traverse(n => {
	        if (n.userData && n.userData.physics && n.userData.physics) {
	            n.userData.physics.body = null;
	        }
	    });

	    this.scene = null;
	};

	/**
	 * 播放器
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Player(options) {
	    UI$1.Control.call(this, options);
	    this.app = options.app;

	    this.scene = null;
	    this.camera = null;
	    this.renderer = null;

	    this.loader = new PlayerLoader(this.app);
	    this.event = new PlayerEvent(this.app);
	    this.audio = new PlayerAudio(this.app);
	    this.animation = new PlayerAnimation(this.app);
	    this.physics = new PlayerPhysics(this.app);

	    this.isPlaying = false;
	    this.clock = new THREE.Clock(false);
	}
	Player.prototype = Object.create(UI$1.Control.prototype);
	Player.prototype.constructor = Player;

	Player.prototype.render = function () {
	    (UI$1.create({
	        xtype: 'div',
	        parent: this.parent,
	        id: 'player',
	        scope: this.id,
	        cls: 'Panel player',
	        style: {
	            display: 'none'
	        }
	    })).render();
	};

	/**
	 * 启动播放器
	 */
	Player.prototype.start = function () {
	    if (this.isPlaying) {
	        return;
	    }
	    this.isPlaying = true;

	    var container = UI$1.get('player', this.id);
	    container.dom.style.display = '';

	    var jsons = (new Converter()).toJSON({
	        options: this.app.options,
	        scene: this.app.editor.scene,
	        camera: this.app.editor.camera,
	        renderer: this.app.editor.renderer,
	        scripts: this.app.editor.scripts,
	        animation: this.app.editor.animation,
	    });

	    this.loader.create(jsons).then(obj => {
	        this.initPlayer(obj);

	        this.event.create(this.scene, this.camera, this.renderer, obj.scripts);
	        this.audio.create(this.scene, this.camera, this.renderer, this.loader);
	        this.animation.create(this.scene, this.camera, this.renderer, obj.animation);
	        this.physics.create(this.scene, this.camera, this.renderer);

	        this.clock.start();
	        this.event.init();
	        this.renderScene();
	        this.event.start();

	        requestAnimationFrame(this.animate.bind(this));
	    });
	};

	/**
	 * 停止播放器
	 */
	Player.prototype.stop = function () {
	    if (!this.isPlaying) {
	        return;
	    }
	    this.isPlaying = false;

	    this.event.stop();

	    this.loader.dispose();
	    this.event.dispose();
	    this.audio.dispose();
	    this.animation.dispose();
	    this.physics.dispose();

	    var container = UI$1.get('player', this.id);
	    container.dom.removeChild(this.renderer.domElement);
	    container.dom.style.display = 'none';

	    this.scene = null;
	    this.camera = null;
	    this.renderer = null;

	    this.clock.stop();
	};

	/**
	 * 初始化播放器
	 * @param {*} obj 
	 */
	Player.prototype.initPlayer = function (obj) {
	    var container = UI$1.get('player', this.id);
	    var editor = this.app.editor;

	    this.camera = obj.camera || new THREE.PerspectiveCamera(
	        editor.DEFAULT_CAMERA.fov,
	        container.dom.clientWidth / container.dom.clientHeight,
	        editor.DEFAULT_CAMERA.near,
	        editor.DEFAULT_CAMERA.far
	    );
	    this.camera.updateProjectionMatrix();

	    this.renderer = obj.renderer || new THREE.WebGLRenderer({
	        antialias: true
	    });    this.renderer.setSize(container.dom.clientWidth, container.dom.clientHeight);
	    container.dom.appendChild(this.renderer.domElement);

	    var listener = obj.audioListener || new THREE.AudioListener();
	    this.camera.add(listener);

	    this.scene = obj.scene || new THREE.Scene();
	};

	Player.prototype.renderScene = function () {
	    this.renderer.render(this.scene, this.camera);
	};

	Player.prototype.animate = function () {
	    if (!this.isPlaying) {
	        return;
	    }

	    this.renderScene();

	    var deltaTime = this.clock.getDelta();

	    this.event.update(this.clock, deltaTime);
	    this.animation.update(this.clock, deltaTime);
	    this.physics.update(this.clock, deltaTime);

	    requestAnimationFrame(this.animate.bind(this));
	};

	/**
	 * 历史记录
	 * @author dforrer / https://github.com/dforrer
	 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
	 */
	function History(editor) {
	    this.app = editor.app;

	    this.editor = editor;
	    this.undos = [];
	    this.redos = [];
	    this.lastCmdTime = new Date();
	    this.idCounter = 0;

	    Command.call(this, editor);
	}
	History.prototype = Object.create(Command.prototype);

	Object.assign(History.prototype, {

	    constructor: History,

	    execute: function (cmd, optionalName) {

	        var lastCmd = this.undos[this.undos.length - 1];
	        var timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

	        var isUpdatableCmd = lastCmd &&
	            lastCmd.updatable &&
	            cmd.updatable &&
	            lastCmd.object === cmd.object &&
	            lastCmd.type === cmd.type &&
	            lastCmd.script === cmd.script &&
	            lastCmd.attributeName === cmd.attributeName;

	        if (isUpdatableCmd && cmd.type === "SetScriptValueCommand") {

	            // When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

	            lastCmd.update(cmd);
	            cmd = lastCmd;

	        } else if (isUpdatableCmd && timeDifference < 500) {

	            lastCmd.update(cmd);
	            cmd = lastCmd;

	        } else {

	            // the command is not updatable and is added as a new part of the history

	            this.undos.push(cmd);
	            cmd.id = ++this.idCounter;

	        }
	        cmd.name = (optionalName !== undefined) ? optionalName : cmd.name;
	        cmd.execute();
	        cmd.inMemory = true;

	        this.lastCmdTime = new Date();

	        // clearing all the redo-commands

	        this.redos = [];
	        this.app.call('historyChanged', this, cmd);

	    },

	    undo: function () {
	        var cmd = undefined;

	        if (this.undos.length > 0) {
	            cmd = this.undos.pop();

	            if (cmd.inMemory === false) {
	                cmd.fromJSON(cmd.json);
	            }
	        }

	        if (cmd !== undefined) {
	            cmd.undo();
	            this.redos.push(cmd);
	            this.app.call('historyChanged', this, cmd);
	        }

	        return cmd;
	    },

	    redo: function () {
	        var cmd = undefined;

	        if (this.redos.length > 0) {
	            cmd = this.redos.pop();

	            if (cmd.inMemory === false) {
	                cmd.fromJSON(cmd.json);
	            }
	        }

	        if (cmd !== undefined) {
	            cmd.execute();
	            this.undos.push(cmd);
	            this.app.call('historyChanged', this, cmd);
	        }

	        return cmd;
	    },

	    toJSON: function () {
	        var history = {};
	        history.undos = [];
	        history.redos = [];

	        // Append Undos to History
	        for (var i = 0; i < this.undos.length; i++) {
	            if (this.undos[i].hasOwnProperty("json")) {
	                history.undos.push(this.undos[i].json);
	            }
	        }

	        // Append Redos to History
	        for (var i = 0; i < this.redos.length; i++) {
	            if (this.redos[i].hasOwnProperty("json")) {
	                history.redos.push(this.redos[i].json);
	            }
	        }

	        return history;
	    },

	    fromJSON: function (json) {
	        if (json === undefined) return;

	        for (var i = 0; i < json.undos.length; i++) {
	            var cmdJSON = json.undos[i];
	            var cmd = new window[cmdJSON.type](); // creates a new object of type "json.type"
	            cmd.json = cmdJSON;
	            cmd.id = cmdJSON.id;
	            cmd.name = cmdJSON.name;
	            this.undos.push(cmd);
	            this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter
	        }

	        for (var i = 0; i < json.redos.length; i++) {
	            var cmdJSON = json.redos[i];
	            var cmd = new window[cmdJSON.type](); // creates a new object of type "json.type"
	            cmd.json = cmdJSON;
	            cmd.id = cmdJSON.id;
	            cmd.name = cmdJSON.name;
	            this.redos.push(cmd);
	            this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter
	        }

	        // Select the last executed undo-command
	        this.app.call('historyChanged', this, this.undos[this.undos.length - 1]);
	    },

	    clear: function () {
	        this.undos = [];
	        this.redos = [];
	        this.idCounter = 0;

	        this.app.call('historyChanged', this);
	    },

	    goToState: function (id) {
	        var cmd = this.undos.length > 0 ? this.undos[this.undos.length - 1] : undefined; // next cmd to pop

	        if (cmd === undefined || id > cmd.id) {
	            cmd = this.redo();
	            while (cmd !== undefined && id > cmd.id) {
	                cmd = this.redo();
	            }
	        } else {
	            while (true) {
	                cmd = this.undos[this.undos.length - 1]; // next cmd to pop
	                if (cmd === undefined || id === cmd.id) break;
	                cmd = this.undo();
	            }
	        }

	        this.editor.app.call('sceneGraphChanged', this);
	        this.editor.app.call('historyChanged', this, cmd);
	    },

	    enableSerialization: function (id) {

	        /**
	         * because there might be commands in this.undos and this.redos
	         * which have not been serialized with .toJSON() we go back
	         * to the oldest command and redo one command after the other
	         * while also calling .toJSON() on them.
	         */

	        this.goToState(-1);

	        var cmd = this.redo();
	        while (cmd !== undefined) {
	            if (!cmd.hasOwnProperty("json")) {
	                cmd.json = cmd.toJSON();
	            }
	            cmd = this.redo();
	        }

	        this.goToState(id);
	    }
	});

	/**
	 * 本地存储
	 * @author mrdoob / http://mrdoob.com/
	 */
	function Storage() {
	    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	    if (indexedDB === undefined) {
	        console.warn('Storage: IndexedDB不可用。');
	        return { init: function () { }, get: function () { }, set: function () { }, clear: function () { } };
	    }

	    var name = 'threejs-editor';
	    var version = 1;

	    var database;

	    return {
	        init: function (callback) {
	            var request = indexedDB.open(name, version);
	            request.onupgradeneeded = function (event) {
	                var db = event.target.result;

	                if (db.objectStoreNames.contains('states') === false) {

	                    db.createObjectStore('states');

	                }
	            };
	            request.onsuccess = function (event) {
	                database = event.target.result;

	                callback();
	            };
	            request.onerror = function (event) {
	                console.error('IndexedDB', event);
	            };
	        },

	        get: function (callback) {
	            var transaction = database.transaction(['states'], 'readwrite');
	            var objectStore = transaction.objectStore('states');
	            var request = objectStore.get(0);
	            request.onsuccess = function (event) {
	                callback(event.target.result);
	            };

	        },

	        set: function (data, callback) {
	            var start = performance.now();

	            var transaction = database.transaction(['states'], 'readwrite');
	            var objectStore = transaction.objectStore('states');
	            var request = objectStore.put(data, 0);
	            request.onsuccess = function (event) {
	                console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', '保存到IndexedDB中。 ' + (performance.now() - start).toFixed(2) + 'ms');
	            };

	        },

	        clear: function () {
	            if (database === undefined) return;

	            var transaction = database.transaction(['states'], 'readwrite');
	            var objectStore = transaction.objectStore('states');
	            var request = objectStore.clear();
	            request.onsuccess = function (event) {
	                console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', '清空IndexedDB。');
	            };
	        }
	    };
	}

	/**
	 * 动画管理器
	 * @author tengge / https://github.com/tengge1
	 * @param {*} app 应用程序
	 */
	function AnimationManager(app) {
	    this.app = app;
	    this.animations = [];
	}
	/**
	 * 清空所有
	 */
	AnimationManager.prototype.clear = function () {
	    this.animations = [];

	    for (var i = 0; i < 3; i++) {
	        var group = new AnimationGroup({
	            name: `组${i + 1}`,
	            index: i
	        });
	        this.animations.push(group);
	    }
	};

	/**
	 * 添加动画组
	 * @param {*} group 动画组
	 */
	AnimationManager.prototype.add = function (group) {
	    this.insert(group, this.animations.length);
	};

	/**
	 * 插入动画组
	 * @param {*} group 动画组
	 * @param {*} index 索引
	 */
	AnimationManager.prototype.insert = function (group, index = 0) {
	    if (!(group instanceof AnimationGroup)) {
	        console.warn(`AnimationManager: group不是AnimationGroup的实例。`);
	        return;
	    }
	    this.animations.splice(index, 0, group);
	};

	/**
	 * 删除组
	 * @param {*} group 动画组
	 */
	AnimationManager.prototype.remove = function (group) {
	    var index = this.animations.indexOf(group);
	    if (index > -1) {
	        this.animations.splice(index, 1);
	    }
	};

	/**
	 * 根据uuid删除组
	 * @param {*} uuid 
	 */
	AnimationManager.prototype.removeByUUID = function (uuid) {
	    var index = this.animations.findIndex(n => n.uuid === uuid);
	    if (index > -1) {
	        this.animations.splice(index, 1);
	    }
	};

	/**
	 * 获取动画
	 */
	AnimationManager.prototype.getAnimationGroups = function () {
	    return this.animations;
	};

	/**
	 * 设置动画
	 * @param {*} animations 
	 */
	AnimationManager.prototype.setAnimationGroups = function (animations) {
	    this.animations = animations;
	};

	/**
	 * 根据uuid获取动画
	 * @param {*} uuid 
	 */
	AnimationManager.prototype.getAnimationByUUID = function (uuid) {
	    var group = this.animations.filter(n => n.animations.findIndex(m => m.uuid === uuid) > -1)[0];
	    if (group === undefined) {
	        return null;
	    }
	    return group.animations.filter(n => n.uuid === uuid)[0];
	};

	/**
	 * 编辑器
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Editor(app) {
	    this.app = app;
	    this.app.editor = this;

	    // 基础
	    this.history = new History(this);
	    this.storage = new Storage();

	    // 场景
	    this.scene = new THREE.Scene();
	    this.scene.name = '场景';
	    this.scene.background = new THREE.Color(0xaaaaaa);

	    this.sceneHelpers = new THREE.Scene();

	    this.sceneID = null; // 当前场景ID
	    this.sceneName = null; // 当前场景名称

	    // 相机
	    this.DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
	    this.DEFAULT_CAMERA.name = '默认相机';
	    this.DEFAULT_CAMERA.userData.isDefault = true;
	    this.DEFAULT_CAMERA.position.set(20, 10, 20);
	    this.DEFAULT_CAMERA.lookAt(new THREE.Vector3());

	    this.camera = this.DEFAULT_CAMERA.clone();

	    // 渲染器
	    this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });
	    this.renderer.gammaInput = false;
	    this.renderer.gammaOutput = false;
	    this.renderer.shadowMap.enabled = true;
	    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	    this.renderer.autoClear = false;
	    this.renderer.autoUpdateScene = false;
	    this.renderer.setPixelRatio(window.devicePixelRatio);

	    this.app.viewport.container.dom.appendChild(this.renderer.domElement);
	    this.renderer.setSize(this.app.viewport.container.dom.offsetWidth, this.app.viewport.container.dom.offsetHeight);

	    // 音频监听器
	    this.audioListener = new THREE.AudioListener();
	    this.audioListener.name = '音频监听器';

	    // 物体
	    this.object = {};

	    // 物体
	    this.objects = [];

	    // 脚本 格式：{ uuid: { id: 'mongoDB id', name: 'Script Name', type: 'Script Type', source: 'Source Code', uuid: 'uuid' }}
	    // 其中，uuid是创建脚本时自动生成，不可改变，关联时使用，id是mongo数据库ID字段；name：随便填写；type：javascript，vertexShader, fragmentShader, json；source：源码。
	    this.scripts = {};
	    this.animation = new AnimationManager(this.app);

	    // 帮助器
	    this.helpers = {};

	    // 当前选中物体
	    this.selected = null;

	    // 网格
	    this.grid = new THREE.GridHelper(30, 30, 0x444444, 0x888888);
	    this.grid.visible = this.app.options.showGrid;
	    this.sceneHelpers.add(this.grid);

	    // 平移旋转缩放控件
	    this.transformControls = new THREE.TransformControls(this.camera, this.app.viewport.container.dom);
	    this.sceneHelpers.add(this.transformControls);

	    // 编辑器控件
	    this.controls = new THREE.EditorControls(this.camera, this.app.viewport.container.dom);

	    // 性能控件
	    this.stats = new Stats();
	    this.stats.dom.style.position = 'absolute';
	    this.stats.dom.style.left = '8px';
	    this.stats.dom.style.top = '8px';
	    this.stats.dom.style.zIndex = 'initial';
	    this.app.viewport.container.dom.appendChild(this.stats.dom);

	    // 事件
	    this.app.on(`appStarted.${this.id}`, this.onAppStarted.bind(this));
	    this.app.on(`optionsChanged.${this.id}`, this.onOptionsChanged.bind(this));
	}
	Editor.prototype.onAppStarted = function () {
	    this.clear();
	};

	// -------------------- 场景 --------------------------

	Editor.prototype.setScene = function (scene) { // 设置场景
	    // 移除原有物体
	    var objects = this.scene.children;
	    while (objects.length > 0) {
	        this.removeObject(objects[0]);
	    }

	    // 添加新物体
	    var children = scene.children.slice();
	    scene.children.length = 0;
	    this.scene = scene;

	    children.forEach(n => {
	        this.addObject(n);
	    });

	    this.app.call('sceneGraphChanged', this);
	};

	Editor.prototype.clear = function (addObject = true) { // 清空场景
	    this.history.clear();
	    this.storage.clear();

	    this.camera.copy(this.DEFAULT_CAMERA);

	    if (this.camera.children.findIndex(o => o instanceof THREE.AudioListener) === -1) {
	        this.camera.add(this.audioListener);
	    }

	    if (this.scene.background instanceof THREE.Texture) {
	        this.scene.background = new THREE.Color(0xaaaaaa);
	    } else if (this.scene.background instanceof THREE.Color) {
	        this.scene.background.setHex(0xaaaaaa);
	    }

	    this.scene.fog = null;

	    var objects = this.scene.children;

	    while (objects.length > 0) {
	        this.removeObject(objects[0]);
	    }

	    this.textures = {};
	    this.scripts = {};
	    this.animation.clear();

	    this.deselect();

	    // 添加默认元素
	    if (addObject) {
	        var light1 = new THREE.AmbientLight(0xffffff, 0.24);
	        light1.name = '环境光';
	        this.addObject(light1);

	        var light2 = new THREE.DirectionalLight(0xffffff, 0.56);
	        light2.name = '平行光';
	        light2.castShadow = true;
	        light2.position.set(5, 10, 7.5);
	        light2.shadow.mapSize.x = 2048;
	        light2.shadow.mapSize.y = 2048;
	        light2.shadow.camera.left = -100;
	        light2.shadow.camera.right = 100;
	        light2.shadow.camera.top = 100;
	        light2.shadow.camera.bottom = -100;
	        this.addObject(light2);
	    }

	    this.app.call('editorCleared', this);
	    this.app.call('scriptChanged', this);
	    this.app.call('animationChanged', this);
	};

	// ---------------------- 物体 ---------------------------

	Editor.prototype.objectByUuid = function (uuid) { // 根据uuid获取物体
	    return this.scene.getObjectByProperty('uuid', uuid, true);
	};

	Editor.prototype.addObject = function (object) { // 添加物体
	    this.scene.add(object);

	    object.traverse(child => {
	        this.addHelper(child);
	    });

	    this.app.call('objectAdded', this, object);
	    this.app.call('sceneGraphChanged', this);
	};

	Editor.prototype.moveObject = function (object, parent, before) { // 移动物体
	    if (parent === undefined) {
	        parent = this.scene;
	    }

	    parent.add(object);

	    // sort children array
	    if (before !== undefined) {
	        var index = parent.children.indexOf(before);
	        parent.children.splice(index, 0, object);
	        parent.children.pop();
	    }

	    this.app.call('sceneGraphChanged', this);
	};

	Editor.prototype.removeObject = function (object) { // 移除物体
	    if (object.parent === null) { // 避免删除相机或场景
	        return;
	    }

	    object.traverse(child => {
	        this.removeHelper(child);
	    });

	    object.parent.remove(object);

	    this.app.call('objectRemoved', this, object);
	    this.app.call('sceneGraphChanged', this);
	};

	// ------------------------- 帮助 ------------------------------

	Editor.prototype.addHelper = function (object) { // 添加物体帮助器
	    var options = this.app.options;

	    var helper = null;

	    if (object instanceof THREE.Camera) { // 相机
	        helper = new THREE.CameraHelper(object, 1);
	        helper.visible = options.showCameraHelper;
	    } else if (object instanceof THREE.PointLight) { // 点光源
	        helper = new THREE.PointLightHelper(object, 1);
	        helper.visible = options.showPointLightHelper;
	    } else if (object instanceof THREE.DirectionalLight) { // 平行光
	        helper = new THREE.DirectionalLightHelper(object, 1);
	        helper.visible = options.showDirectionalLightHelper;
	    } else if (object instanceof THREE.SpotLight) { // 聚光灯
	        helper = new THREE.SpotLightHelper(object, 1);
	        helper.visible = options.showSpotLightHelper;
	    } else if (object instanceof THREE.HemisphereLight) { // 半球光
	        helper = new THREE.HemisphereLightHelper(object, 1);
	        helper.visible = options.showHemisphereLightHelper;
	    } else if (object instanceof THREE.RectAreaLight) { // 矩形光
	        helper = new THREE.RectAreaLightHelper(object, 0xffffff);
	        helper.visible = options.showRectAreaLightHelper;
	    } else if (object instanceof THREE.SkinnedMesh) { // 骨骼
	        helper = new THREE.SkeletonHelper(object);
	        helper.visible = options.showSkeletonHelper;
	    } else {
	        // 该类型物体没有帮助器
	        return;
	    }

	    var geometry = new THREE.SphereBufferGeometry(2, 4, 2);
	    var material = new THREE.MeshBasicMaterial({
	        color: 0xff0000,
	        visible: false
	    });

	    var picker = new THREE.Mesh(geometry, material);
	    picker.name = 'picker';
	    picker.userData.object = object;
	    helper.add(picker);

	    this.sceneHelpers.add(helper);
	    this.helpers[object.id] = helper;
	    this.objects.push(picker);
	};

	Editor.prototype.removeHelper = function (object) { // 移除物体帮助
	    if (this.helpers[object.id] !== undefined) {

	        var helper = this.helpers[object.id];
	        helper.parent.remove(helper);
	        delete this.helpers[object.id];

	        var objects = this.objects;
	        objects.splice(objects.indexOf(helper.getObjectByName('picker')), 1);
	    }
	};

	Editor.prototype.onOptionsChanged = function (options) { // 帮助器改变事件
	    this.grid.visible = options.showGrid === undefined ? true : options.showGrid;
	    Object.keys(this.helpers).forEach(n => {
	        var helper = this.helpers[n];
	        if (helper instanceof THREE.CameraHelper) {
	            helper.visible = options.showCameraHelper;
	        } else if (helper instanceof THREE.PointLightHelper) {
	            helper.visible = options.showPointLightHelper;
	        } else if (helper instanceof THREE.DirectionalLightHelper) {
	            helper.visible = options.showDirectionalLightHelper;
	        } else if (helper instanceof THREE.SpotLightHelper) {
	            helper.visible = options.showSpotLightHelper;
	        } else if (helper instanceof THREE.HemisphereLightHelper) {
	            helper.visible = options.showHemisphereLightHelper;
	        } else if (helper instanceof THREE.RectAreaLightHelper) {
	            helper.visible = options.showRectAreaLightHelper;
	        } else if (helper instanceof THREE.SkeletonHelper) {
	            helper.visible = options.showSkeletonHelper;
	        }
	    });
	};

	// ------------------------ 脚本 ----------------------------

	Editor.prototype.addScript = function (object, script) { // 添加脚本
	    if (this.scripts[object.uuid] === undefined) {
	        this.scripts[object.uuid] = [];
	    }

	    this.scripts[object.uuid].push(script);

	    this.app.call('scriptAdded', this, script);
	};

	Editor.prototype.removeScript = function (object, script) { // 移除脚本
	    if (this.scripts[object.uuid] === undefined) {
	        return;
	    }

	    var index = this.scripts[object.uuid].indexOf(script);

	    if (index !== -1) {
	        this.scripts[object.uuid].splice(index, 1);
	    }

	    this.app.call('scriptRemoved', this);
	};

	// ------------------------ 选中事件 --------------------------------

	Editor.prototype.select = function (object) { // 选中物体
	    if (this.selected === object) {
	        return;
	    }

	    this.selected = object;

	    this.app.call('objectSelected', this, object);
	};

	Editor.prototype.selectById = function (id) { // 根据id选中物体
	    if (id === this.camera.id) {
	        this.select(this.camera);
	        return;
	    }

	    this.select(this.scene.getObjectById(id, true));
	};

	Editor.prototype.selectByUuid = function (uuid) { // 根据uuid选中物体
	    var _this = this;
	    this.scene.traverse(function (child) {
	        if (child.uuid === uuid) {
	            _this.select(child);
	        }
	    });
	};

	Editor.prototype.deselect = function () { // 取消选中物体
	    this.select(null);
	};

	// ---------------------- 焦点事件 --------------------------

	Editor.prototype.focus = function (object) { // 设置焦点
	    this.app.call('objectFocused', this, object);
	};

	Editor.prototype.focusById = function (id) { // 根据id设置交点
	    var obj = this.scene.getObjectById(id, true);
	    if (obj) {
	        this.focus(obj);
	    }
	};

	// ----------------------- 命令事件 --------------------------

	Editor.prototype.execute = function (cmd, optionalName) { // 执行事件
	    this.history.execute(cmd, optionalName);
	};

	Editor.prototype.undo = function () { // 撤销事件
	    this.history.undo();
	};

	Editor.prototype.redo = function () { // 重做事件
	    this.history.redo();
	};

	/**
	 * 物理
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Physics(options) {
	    this.app = options.app;
	    this.app.physics = this;

	    // 各种参数
	    var gravityConstant = -9.8;
	    this.margin = 0.05;
	    this.transformAux1 = new Ammo.btTransform();

	    this.time = 0;
	    this.armMovement = 0;

	    // 物理环境配置
	    this.collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration(); // 软体刚体碰撞配置
	    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration); // 碰撞调度器
	    this.broadphase = new Ammo.btDbvtBroadphase(); // dbvt粗测
	    this.solver = new Ammo.btSequentialImpulseConstraintSolver(); // 顺序脉冲约束求解器
	    this.softBodySolver = new Ammo.btDefaultSoftBodySolver(); // 默认软体求解器

	    this.world = new Ammo.btSoftRigidDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration, this.softBodySolver);

	    var gravity = new Ammo.btVector3(0, gravityConstant, 0);
	    this.world.setGravity(gravity);
	    this.world.getWorldInfo().set_m_gravity(gravity);

	    this.rigidBodies = [];

	    // 扔球
	    this.enableThrowBall = false;
	}

	Physics.prototype.start = function () {
	    this.app.on(`animate.Physics`, this.update.bind(this));
	    this.app.on(`mThrowBall.Physics`, this.onEnableThrowBall.bind(this));
	};

	/**
	 * 创建刚体
	 * @param {*} threeObject three.js中Object3D对象
	 * @param {*} physicsShape 物理形状
	 * @param {*} mass 重力
	 * @param {*} pos 位置
	 * @param {*} quat 旋转
	 */
	Physics.prototype.createRigidBody = function (threeObject, physicsShape, mass, pos, quat) {
	    threeObject.position.copy(pos);
	    threeObject.quaternion.copy(quat);

	    var transform = new Ammo.btTransform();
	    transform.setIdentity();
	    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	    var motionState = new Ammo.btDefaultMotionState(transform);

	    // 惯性
	    var localInertia = new Ammo.btVector3(0, 0, 0);
	    physicsShape.calculateLocalInertia(mass, localInertia);

	    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
	    var body = new Ammo.btRigidBody(rbInfo);

	    threeObject.userData.physicsBody = body;

	    // 重力大于0才响应物理事件
	    if (mass > 0) {
	        this.rigidBodies.push(threeObject);
	        body.setActivationState(4);
	    }

	    this.world.addRigidBody(body);

	    return body;
	};

	/**
	 * 创建一个平板
	 * @param {*} sx 长度
	 * @param {*} sy 厚度
	 * @param {*} sz 宽度
	 * @param {*} mass 重力
	 * @param {*} pos 位置
	 * @param {*} quat 旋转
	 * @param {*} material 材质
	 */
	Physics.prototype.createParalellepiped = function (sx, sy, sz, mass, pos, quat, material) {
	    var threeObject = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), material);
	    var shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
	    shape.setMargin(this.margin);

	    this.createRigidBody(threeObject, shape, mass, pos, quat);

	    return threeObject;
	};

	Physics.prototype.onThrowBall = function (event) {
	    var mouse = new THREE.Vector2();
	    var raycaster = new THREE.Raycaster();
	    var camera = this.app.editor.camera;

	    var width = UI.get('viewport').dom.clientWidth;
	    var height = UI.get('viewport').dom.clientHeight;

	    mouse.set((event.offsetX / width) * 2 - 1, -(event.offsetY / height) * 2 + 1);
	    raycaster.setFromCamera(mouse, camera);

	    // Creates a ball and throws it
	    var ballMass = 35;
	    var ballRadius = 0.4;
	    var ballMaterial = new THREE.MeshPhongMaterial({
	        color: 0x202020
	    });

	    var ball = new THREE.Mesh(new THREE.SphereBufferGeometry(ballRadius, 14, 10), ballMaterial);
	    ball.castShadow = true;
	    ball.receiveShadow = true;
	    this.app.editor.scene.add(ball);

	    var ballShape = new Ammo.btSphereShape(ballRadius);
	    ballShape.setMargin(this.margin);

	    var pos = new THREE.Vector3();
	    pos.copy(raycaster.ray.direction);
	    pos.add(raycaster.ray.origin);

	    var quat = new THREE.Quaternion();
	    quat.set(0, 0, 0, 1);

	    var ballBody = this.createRigidBody(ball, ballShape, ballMass, pos, quat);

	    pos.copy(raycaster.ray.direction);
	    pos.multiplyScalar(24);

	    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
	};

	Physics.prototype.update = function (clock, deltaTime) {
	    this.world.stepSimulation(deltaTime, 10);

	    // Update rigid bodies
	    for (var i = 0, il = this.rigidBodies.length; i < il; i++) {
	        var objThree = this.rigidBodies[i];
	        var objPhys = objThree.userData.physicsBody;
	        var ms = objPhys.getMotionState();
	        if (ms) {
	            ms.getWorldTransform(this.transformAux1);
	            var p = this.transformAux1.getOrigin();
	            var q = this.transformAux1.getRotation();
	            objThree.position.set(p.x(), p.y(), p.z());
	            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
	        }
	    }
	};

	Physics.prototype.onEnableThrowBall = function () {
	    if (this.enableThrowBall) {
	        this.enableThrowBall = false;
	        UI.get('mThrowBall').dom.innerHTML = '开启探测小球';
	        this.app.on(`click.Physics`, null);
	    } else {
	        this.enableThrowBall = true;
	        UI.get('mThrowBall').dom.innerHTML = '关闭探测小球';
	        this.app.on(`click.Physics`, this.onThrowBall.bind(this));
	    }
	};

	/**
	 * 用户界面API
	 */
	function UIAPI() {

	}

	UIAPI.prototype.addMenu = function () {
	    alert('添加菜单');
	};

	/**
	 * 编辑器API
	 */
	function API() {

	}

	Object.assign(API.prototype, UIAPI.prototype);

	/**
	 * 应用程序
	 * @author mrdoob / http://mrdoob.com/
	 * @author tengge / https://github.com/tengge1
	 */
	function Application(container, options) {

	    // 容器
	    this.container = container;
	    this.width = this.container.clientWidth;
	    this.height = this.container.clientHeight;

	    // 配置
	    this.options = new Options(options);

	    // 事件
	    this.event = new EventDispatcher(this);
	    this.call = this.event.call.bind(this.event);
	    this.on = this.event.on.bind(this.event);

	    var params = { app: this };

	    // 用户界面
	    this.ui = UI$1;
	    this.menubar = new Menubar(params); // 菜单栏
	    this.toolbar = new Toolbar(params); // 工具栏
	    this.viewport = new Viewport(params); // 场景编辑区
	    this.sidebar = new Sidebar(params); // 侧边栏
	    this.sidebar2 = new Sidebar$1(params); // 侧边栏2
	    this.bottomPanel = new BottomPanel(params); // 底部面板
	    this.statusBar = new StatusBar(params); // 状态栏
	    this.script = new ScriptEditor(params); // 脚本编辑器
	    this.player = new Player(params); // 播放器面板

	    UI$1.create({
	        xtype: 'container',
	        parent: this.container,
	        children: [
	            new Menubar(params), {
	                xtype: 'div',
	                style: {
	                    width: '100%',
	                    flex: 1,
	                    display: 'flex',
	                    flexDirection: 'row',
	                },
	                children: [
	                    this.toolbar, {
	                        xtype: 'div',
	                        style: {
	                            position: 'relative',
	                            flex: 1,
	                            display: 'flex',
	                            flexDirection: 'column'
	                        },
	                        children: [{
	                            xtype: 'div',
	                            style: {
	                                position: 'relative',
	                                flex: 1
	                            },
	                            children: [
	                                this.viewport,
	                                this.script,
	                                this.player
	                            ]
	                        },
	                        this.bottomPanel,
	                        this.statusBar
	                        ]
	                    },
	                    this.sidebar2,
	                    this.sidebar
	                ]
	            }
	        ]
	    }).render();

	    // 核心
	    this.editor = new Editor(this); // 编辑器
	    this.physics = new Physics(params);

	    // Html5 Worker
	    // var script = document.querySelector('script[src$="ShadowEditor.js" i]').src; // http://localhost:2000/dist/ShadowEditor.js
	    // this.worker = new Worker(script);
	}

	// ------------------------- 程序控制 -------------------------------

	Application.prototype.start = function () {
	    // 启动事件 - 事件要在ui创建完成后启动
	    this.event.start();

	    this.call('appStart', this);
	    this.call('appStarted', this);

	    // 启动物体引擎
	    this.physics.start();

	    this.call('resize', this);

	    this.log('程序启动成功。');
	};

	Application.prototype.stop = function () {
	    this.call('appStop', this);
	    this.call('appStoped', this);

	    this.log('程序已经停止');

	    this.event.stop();
	};

	// ----------------------- 记录日志  --------------------------------

	Application.prototype.log = function (content) { // 普通日志
	    this.call('log', this, content);
	};

	Application.prototype.warn = function (content) { // 警告日志
	    this.call('log', this, content, 'warn');
	};

	Application.prototype.error = function (content) { // 错误日志
	    this.call('log', this, content, 'error');
	};

	// API
	Object.assign(Application.prototype, API.prototype);

	exports.Options = Options;
	exports.Application = Application;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
