import Vue from 'vue';

import {newDataArr} from './json-data.js';

window.onload = function(){

    Vue.component('table-row', {
        template: '<tr>' +
                        '<td>{{item.id}}</td>' +
                        '<td>{{item.title}}</td>' +
                        '<td>{{item.amount}}</td>' +
                        '<td>{{item.cost}}</td>' +
                  '</tr>',
        props: ['dataArr', 'item']
    });

    var pgntButton = Vue.component('pgnt-button', {
        template: '<li class="pgnt-btn">' +
                        '<a v-on:click.prevent="buttonClick"  href="#"><slot>{{ qnty }}</slot></a>' +
                  '</li>',
        props: ['qnty'],
        methods: {
            buttonClick: function (event) {

                this.$emit('choosepage');
            }
        }
    });

    var addingRow = Vue.component('adding-row', {
        template: '<tr>' +
                        '<td data-hname="id"><input id="idInput" v-on:input="updateValue($event.target.value, $event.target.id)" class="id-input" type="text"></td>' +
                        '<td data-hname="title"><input id="titleInput" v-on:input="updateValue($event.target.value, $event.target.id)" class="title-input" type="text"></td>' +
                        '<td data-hname="amount"><input id="amountInput" v-on:input="updateValue($event.target.value, $event.target.id)" class="amount-input" type="text"></td>' +
                        '<td data-hname="cost"><input id="costInput" v-on:input="updateValue($event.target.value, $event.target.id)" class="cost-input" type="text">' +
                            '<button class="add-entry" v-on:click="addRow">+</button>' +
                            '<button class="close-addingTr" v-on:click="close">X</button>' +
                        '</td>' +
                    '</tr>',
        data: function () {
            return {
                id: undefined,
                title: undefined,
                amount: undefined,
                cost: undefined
            }
        },
        methods: {
            close: function () {
                this.$emit('closeit');
            },
            addRow: function () {

                /*  Validation  */

                var id = this.id,
                    title = this.title,
                    amount = this.amount,
                    cost = this.cost;

                var isDataValid = false;

                if (id && title && amount && cost) {

                    var isIdValid = id.length > 0 && id.length < 50 && /^\d+$/.test(id),
                        isTitleValid = title.length > 0 && title.length < 50,
                        isAmountValid = /^\d+$/.test(amount) && amount.length > 0 && amount.length < 50 && amount < 1000000000,
                        isCostValid =  /^\d+$/.test(cost) && cost.length > 0 && cost.length < 50 && cost < 1000000000;

                    isDataValid = isIdValid && isTitleValid && isAmountValid && isCostValid;

                    /*  */

                    if ( isDataValid){
                        var newElem = {};

                        newElem.id = this.id;
                        newElem.title = this.title;
                        newElem.amount = this.amount;
                        newElem.cost = this.cost;

                        this.$emit('add-row', newElem);
                    }

                    else {
                        this.$emit('show-error');
                    }
                }

                else {
                    this.$emit('show-error');
                }

                console.log('id = ' + id + ' title = ' + title + ' amount = ' + amount + ' cost = ' + cost);

                console.log('isIdValid = ' + isIdValid + ' isTitleValid = ' + isTitleValid + ' isAmountValid = ' + isAmountValid +  ' isCostValid = ' + isCostValid);


            },
            updateValue: function (value, id) {

                switch (id){
                    case 'idInput':
                        this.id = value;
                        break;
                    case 'titleInput':
                        this.title = value;
                        break;
                    case 'amountInput':
                        this.amount = value;
                        break;
                    case 'costInput':
                        this.cost = value;
                        break;
                }
            }
        }
    });

    var errowRow = Vue.component('errow-row', {
        template: '<tr class="error-tr"><td colspan="4">Введите корректные данные!</td></tr>'
    });

    var tableWrapper = new Vue({
        el: '.table-wrapper',
        data: {
            dataArray: JSON.parse(newDataArr),
            itemsShownNum: 5, // Сколько строк отображать в таблице
            arrShown: [],
            idDataSort: 1,
            titleDataSort: 1,
            amountDataSort: 1,
            costDataSort: 1,
            pgsQntty: 0,
            isBtnActive: false,
            activePageId: 1,
            isAddRowShown: false,
            isErrowRowShown: false
        },
        created: function () {
            this.paginate();
        },
        computed: {
            totalSum : function () {

                var costsSum = 0;

                for (var i = 0; i < this.dataArray.length; i++) {

                    costsSum += this.dataArray[i].cost * this.dataArray[i].amount;
                }
                return costsSum;
            }
        },
        methods: {
            sort: function(event){

                var hname = event.target.getAttribute('data-hname');

                var sortData = event.target.getAttribute('data-sort');

                this.dataArray.sort(function (a, b) {

                    if (a[hname] > b[hname]) {
                        return sortData;
                    }

                    if (a[hname] < b[hname]) {
                        return -sortData;
                    }
                    // если a = b
                    return 0;
                });

                var sortAttr;

                sortData = -sortData;

                switch (hname){
                    case 'id':
                        sortAttr = 'idDataSort';
                        break;
                    case 'title':
                        sortAttr = 'titleDataSort';
                        break;
                    case 'amount':
                        sortAttr = 'amountDataSort';
                        break;
                    case 'cost':
                        sortAttr = 'costDataSort';
                        break;
                }

                this[sortAttr] = sortData;

                this.showTable(1); // перекидываем на первую страницу
            },
            paginate: function(){

                /* Строим ряд кнопок для пагинации и отображаем таблицу на первой странице */

                var sourceLength = this.dataArray.length;

                var itemsShownNum = this.itemsShownNum; // Сколько строк отображать в таблице

                // Количество страниц в таблице:

                var pgQnt = sourceLength % itemsShownNum === 0 ? sourceLength / itemsShownNum : Math.floor(sourceLength / itemsShownNum) + 1;

                this.pgsQntty = pgQnt;

                this.showTable(1);

            },
            showTable: function (pageNum) {

                var itemsShownNum = this.itemsShownNum; // Сколько строк отображать в таблице

                this.arrShown = this.dataArray.slice((pageNum - 1) * itemsShownNum, pageNum * itemsShownNum);

                this.activePageId = pageNum;
            },
            showAddingRow: function () {

                this.isAddRowShown = true;
            },
            showErrorRow: function () {

                this.isErrowRowShown = true;
            },
            closeErrorRow: function () {

                this.isErrowRowShown = false;
            },
            closeAddingRow: function () {

                this.isAddRowShown = false;
                this.isErrowRowShown = false;
            },
            addNewRow: function (nElem) {

                this.closeErrorRow();

                this.dataArray.push(nElem);

                this.paginate();
            }
        }
    });

};

