type Id = string;
type DomExtension = {
    get_s?: Function;
    obj?: Function;

};//*/

///* 
declare global{
    interface HTMLElement {
        vs(data: object): HTMLElement;
    }
}//*/

var dom: Document & DomExtension = document;
var vom: {
    add?: Function
} = {};
dom.get_s = document.querySelectorAll;
dom.obj = dom.getElementById;

function Elem(type_name: keyof HTMLElementTagNameMap, text: string, css_cls: string) {
    var elem: HTMLElement = document.createElement(type_name) as HTMLElement;
    elem.innerText = text;	//value

    if (css_cls) {
        elem.className = css_cls;
    }
    return elem;
}


vom.add = function (container: any | (Id | HTMLElement), elem: Id | HTMLElement, cls: string) {
    if (typeof container == 'string') {
        container = document.querySelector(container);
    }
    if (typeof elem == 'string') {

        elem = document.createElement(elem);
        if (cls) elem.className = cls;

    }

    container.appendChild(elem);

    return elem;
};

HTMLElement.prototype.vs = function (dict: object) {

    for (var key in dict) {
        this.setAttribute(key, dict[key]);
    }

    return this;
};

export { vom, dom, Elem }