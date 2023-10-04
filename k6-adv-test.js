import http from 'k6/http'
import { check, group } from 'k6'
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';
import { Trend, Rate, Gauge, Counter } from 'k6/metrics'

export const options = {
    stages:[
        { duration:'10s', target:5 },
        { duration:'5s', target:5},
        { duration:'10s', target:10},
        { duration:'5s', target:0}
    ]
}
const allFailedRate = new Rate('001_all_todos_failed_rate')
const allDuration = new Trend('001_all_todos_duration')

const singleFailedRate = new Rate('002_single_todos_failed_rate')
const singleDuration = new Trend('002_single_todos_duration')

const addFailedRate = new Rate('003_add_new_todos_failed_rate')
const addDuration = new Trend('003_add_new_todos_duration')

const updateFailedRate = new Rate('004_update_todos_failed_rate')
const updateDuration = new Trend('004_update_todos_duration')

const deleteFailedRate = new Rate('005_delete_todos_failed_rate')
const deleteDuration = new Trend('005_delete_todos_duration')

export default function(){
    group('FT_001 Menboa mengambil semua Data',function(){
        const resAllTodos = http.get('https://dummyjson.com/todos',{
            tags: { judul: 'semua-data-todo'}
        })
        allFailedRate.add(resAllTodos.status >= 400)
        allDuration.add(resAllTodos.timings.duration)
        check(resAllTodos,{
            'statusnya 200':(r) => r.status === 200,
            'total datanya 150':(r) => r.json().total === 150
        })
    })

    group('FT_002 Mencoba mengambil data menggunakan id',function(){
        for(let i = 1; i<=5; i++){
            const resSingleTodos = http.get('https://dummyjson.com/todos/'+i,{
                tags: { judul:'data-todo-dengan-id-1'}
            })
            singleFailedRate.add(resSingleTodos.status >= 400)
            singleDuration.add(resSingleTodos.timings.duration)
            check(resSingleTodos, {
                'statusnya 200': r => r.status === 200
            })
        }
    })
   
    describe('FT_003 Mencoba menambah data baru', function(){     
        const params = {
            todo:'testing',
            completed: false,
            userId: 5
        }
        const resAddNewTodos = http.post('https://dummyjson.com/todos/add',params,{
            tags: { judul:'menambah-data' , input:JSON.stringify(params)}
        })
        addFailedRate.add(resAddNewTodos.status >= 400)
        addDuration.add(resAddNewTodos.timings.duration)
        expect(resAddNewTodos.status, 'statusnya').to.equal(200)
        expect(resAddNewTodos.json().id, 'idnya').to.equal(151)
        expect(resAddNewTodos.json().todo,'responsenya').to.exist
        expect(resAddNewTodos.json().completed,'responsenya').to.exist
        expect(resAddNewTodos.json().userId,'responsenya').to.exist
    })

    describe('FT_004 Mencoba update data', function(){
        const params = { todo:'new Todo' }
        const resUpdateTodos = http.put('https://dummyjson.com/todos/1',params,{
            tags: { judul:'update-data', input:JSON.stringify(params)}
        })
        updateFailedRate.add(resUpdateTodos.status >= 400)
        updateDuration.add(resUpdateTodos.timings.duration)
        expect(resUpdateTodos.status, 'statusnya').to.equal(200)
        expect(resUpdateTodos.json().todo,'todonya').to.equal('new Todo')
    })
    
    describe('FT_005 Mencoba delete data',function(){
        const resDeleteTodos = http.del('https://dummyjson.com/todos/1',{
            tags: { judul:'delete-data'}
        })
        deleteFailedRate.add(resDeleteTodos.status >= 400)
        deleteDuration.add(resDeleteTodos.timings.duration)
        expect(resDeleteTodos.status, 'statusnya').to.equal(200)
        expect(resDeleteTodos.json().isDeleted,'isDeleted').to.equal(true)
    })
}