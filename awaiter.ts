
import { vom, dom, Elem } from "./init__awaiter";

export default class Awaiting{

    constructor(options?: object){}

    public static Start(options: {waitElem?: HTMLElement} & object = {}){

        let awaiting = new Awaiting();
        awaiting.start(options.waitElem, options as any);
        return awaiting;
    }

    /* кол-во элементов анимации */
    blocks_amount: number = 4;
    onfinishMessage: string = 'Нет соединения. Перезагрузите страницу';
    /* количество секунд после выполения `stop()` до чистки элементов анимации */
    private init: number = 3;
    /* предельное время выполения анимации (сек) */    
    limit: number = 7;
    /*  время между переключениями блоков/circles */
    time_wait: number = 500;
    /* интервалы для их отмены */
    private animates: Array<number> = []; 
    /* анимируемые элементы и их состояние */
    private point_states: object = {}; 
    /* значения всех запланированных анимаций на странице (//?) */
    private _timeouts: Array<number> = []; 
    /* событие на старт анимации */
    onstart: Function = null;
    /* событие на истечение определенного времени после старта анимации */
    ontimer: Function = null;
    /* задаение времени для ontimer */
    timer: number = null;                       // задаение времени для ontimer    
    remove_onclean: boolean = true;             // режим чистки по дефолту
    private finished: boolean = null;           // flag that animation is finished
    private onComplited: Function = null;
    /* флаг о том, что таймер не установлен */
    private stop_timer: number = null;          
    private awaitContainer: HTMLElement = null;

    /**
     * Событие завершения анимации (происходит только при истечении limit)
     * @param el - базовый элемент для добавления лейэбла с классом 'limit_loader' о неудаче
     */
    onfinished (el: HTMLElement) {
        
        if (this.onfinishMessage){
            
            var elem = vom.add(el, 'div', 'limit_loader');
            elem.textContent = this.onfinishMessage;
            setTimeout(function () { elem.style.opacity = '1' }, 25);
        }
    };    

    /**
     * Сокрытие элементов анимации
     * @param hide - способ сокрытия
     */
    protected _clean (hide?: boolean) {

        hide = hide == void 0 ? !this.remove_onclean : hide;

        var onclean = this.finished && this.onfinished
                ? (function (_elem) { this.onfinished(_elem.parentElement) }).bind(this)
                : (function (_elem) { });


        if (hide) {

            this.awaitContainer.style.display = 'none';

            for (var id in this.point_states) {

                var elem = dom.obj(id);
                onclean(elem);

                elem.style.display = 'none';
                this.point_states[id] = false;

                var active = elem.querySelector('.circle.active');
                active.className = 'circle';

            }
        }
        else {
                        
            for (var id in this.point_states) {

                var elem = dom.obj(id);
                onclean(elem);
                elem.parentElement.removeChild(elem);
            }
            this.point_states = {};
            
            this.awaitContainer.parentElement.removeChild(this.awaitContainer);
            console.log('awaitContainer was removed');
        }

        if (this.onComplited && !this.finished) this.onComplited();
    };

    /**
     * Останавливает анимацию
     * 
     * @param just_hide - аргумент, устанавливающий способ остановки во внутренней работе прелоадера:
     * В случае `true` - элементы анимации просто скрываются, 
     * В случае `false` - удаляются после сокрытия
     */
    stop (just_hide?: boolean) {

        if (this.finished === false) {

            // если задан finished=false, значит ожидается stop_timer. Выключаем:
            clearTimeout(this.stop_timer);
        }
        else if (this.finished) {

            // если задан finished=true, значит 
            // сработал stop_timer

            // обработка произойдет в clean

        }

        while (this._timeouts.length) {

            clearTimeout(this._timeouts.pop());
        }


        var elems = Object.keys(this.point_states);

        for (var i = 0; i < this.animates.length; i++) {
            
            elems[i] = dom.obj(elems[i]);
            elems[i]['style'].transition = '1s';
            elems[i]['style'].opacity = '0.05';
        }


        setTimeout((function () {

            for (var i = 0; i < this.animates.length; i++) clearInterval(this.animates[i]);

            this.animates = [];

            // тут можно так же удалять созданные элементы					
            this._clean(just_hide);

        }).bind(this), this.init*1000);  // *1000

    };


    /**
     * Запускает анимацию
     * @param elem - контейнер для элементов анимации
     */
    start (elem: HTMLElement, options: { 
        blocks_amount?: number, 
        onfinishMessage?: string, 
        onComplited?: Function
        limit?: number}) {        

        if (typeof options == "object") for (const key in options) this[key] = options[key];

        this.awaitContainer = elem = elem || document.getElementById('await__container');
        if (!elem){
            throw new Error('Elem not found.' + 
                'Define html tag with id="await__container" or pass any elem to start() as first param')
        }

        if (window.getComputedStyle(elem).visibility == 'hidden') elem.style.visibility = 'visible';
        if (window.getComputedStyle(elem).display == 'none') elem.style.display = 'block';
        
        if (!elem.id) throw new Error('you need have id for animate elem');
        if (this.onstart) this.onstart(elem);
        if (this.ontimer && this.timer) {

            this._timeouts.push(

                <any>setTimeout(function () {

                    this.ontimer(elem);

                }, this.timer)
            );
        }

        var anim: HTMLElement = null;

        if (anim = elem.querySelector('.animate_container')) {
            anim.style.display = 'block';
        }
        else {

            anim = vom.add(elem, 'div', 'animate_container').vs({
                id: '__a_' + elem.id,
                style: 'transition:' + this.init + 's;'
            });

            var i = 0; while (i++ < this.blocks_amount) {
                vom.add(anim, 'div', 'circle');
            }
        }


        setTimeout(function () { anim.style.opacity = '1' }, 25);


        if (this.limit) {

            this.finished = false;
            this.stop_timer = <any>setTimeout((function () {

                this.finished = true;
                this.stop();      //true/false

            }).bind(this), this.limit * 1000);
        }

        return this._run(anim);

    };

    /**
     * 
     * @param elem 
     */
    protected _run (elem: HTMLElement) {

        this.point_states[elem.id] = true;
        let _time = this.time_wait || 500;

        var elems = (elem || dom).querySelectorAll('.animate_container .circle');

        var key = 0;

        var _animate: number = <any>setInterval(function () {

            var len = elems.length - 1;

            if (len < 0)
                throw new Error('missing elements inside container for animate');

            var pre = key > 0 ? key - 1 : len;
            elems[key].className = 'circle active';
            elems[pre].className = 'circle';

            if (key < len) { key += 1 } else key = 0;

        }, _time);

        this.animates.push(_animate);

        return _animate;

    }

}
