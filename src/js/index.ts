import { Vue } from "../../node_modules/vue/types/vue";
import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";


let baseUrl: string = "http://mort-rest.azurewebsites.net/api/cycles/"

interface ICycle {
    cycle_id: number
    cycle_name: string
    cycle_coordinates: string
    fk_cycle_status_id: number
}
new Vue({
    el: "#app",
    data: {
        cycles: []
    },
    created(){
        this.getAllBikes()
    },
    methods: {
        helperGetAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        getAllBikes() {
            this.helperGetAndShow(baseUrl)
        }
    }
})