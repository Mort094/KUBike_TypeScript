<<<<<<< HEAD
import { Vue } from "../../node_modules/vue/types/vue";
import axios, {
=======
import Axios , {
>>>>>>> parent of 87d8b27... VIRKER
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";


let baseUrl: string = "http://mort-rest.azurewebsites.net/api/cycles";

interface ICycle {
    cycle_id: number;
    cycle_name: string;
    cycle_coordinates: string;
    cycle_status_id: number;
}
new Vue({
        el: "#app",
        data:{
            cycles: []
        },
        methods: {
            helperGetAndShow(url: string) {
                Axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.Bikes = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            }
        },
        getAllBikes(){
            this.helperGetAndShow(baseUrl)
        }
})