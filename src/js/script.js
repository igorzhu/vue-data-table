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
            activePageId: 1
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

                console.log(event.target.tagName);

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

                var pgQnt = sourceLength % itemsShownNum === 0 ? sourceLength % itemsShownNum : sourceLength % itemsShownNum + 1;

                this.pgsQntty = pgQnt;

                this.showTable(1);

            },
            showTable: function (pageNum) {

                var itemsShownNum = this.itemsShownNum; // Сколько строк отображать в таблице

                this.arrShown = this.dataArray.slice((pageNum - 1) * itemsShownNum, pageNum * itemsShownNum);

                this.activePageId = pageNum;
            }
        }
    });

};

