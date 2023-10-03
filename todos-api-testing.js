import http from 'k6/http'
import { check, group } from 'k6'

export const options = {
    /* duration: '20s', 
    iterations: 10,
    vus: 5,
    thresholds:{
        http_req_duration:['avg<300','p(95)<320'],
        http_req_failed:['rate<0.05'],
    } */

    stages:[
        { duration:'10s', target:5 },
        { duration:'5s', target:2},
        { duration:'10s', target:10},
        { duration:'5s', target:0}
    ]
}
export default function(){

    group('FT_001 Menboa mengambil semua Data',function(){
        const resAllTodos = http.get('https://dummyjson.com/todos')
        check(resAllTodos,{
            'status nya 200':(r) => r.status === 200,
            'total data nya 150':(r) => r.json().total === 150
        })
    })
    group('FT_002 Mencoba menambahkan data', function(){
        const params = {
            todo:'testing',
            completed: false,
            userId: 5
        }
        const resAddNewTodos = http.post('https://dummyjson.com/todos/add',params)
        check(resAddNewTodos, {
            'status nya 200':(r) => r.status === 200,
            'id nya 151': (r) => r.json().id === 151,
            'di dalam nya ada todo': (r)=>'todo' in r.json(),
            'di dalam nya ada completed': (r)=>'completed' in r.json(),
            'di dalam nya ada userId': (r)=>'userId' in r.json(),
        })
    })
    
    group('FT_003 Mencoba update data',function(){
        const params = { todo:'new Todo' }
        const resUpdateTodos = http.put('https://dummyjson.com/todos/1',params)
        check(resUpdateTodos, {
            'status nya 200':(r) => r.status === 200,
            'todo yang lama digantikan dengan todo yang baru':(r) => r.json().todo === 'new Todo'
        })
    })
    group('FT_004 Mencoba delete data',function(){
        const resDeleteTodos = http.del('https://dummyjson.com/todos/1')
        check(resDeleteTodos, {
            'status nya 200':(r) => r.status === 200,
            'todo berhasil didelete': (r) => r.json().isDeleted === true,
        })

    })


}