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
        loggedIn: false,
        email: "",
        password: "",
        errorMessage: "",
        cycles: []
    },
    created() {
        this.getAllBikes()
    },
    methods: {
        login() {
            if (this.password == "test" && this.email == "test") { //axios get
                this.loggedIn = true
            } else {
                this.errorMessage = "Wrong"
            }

        }, logout() {
            this.loggedIn = false
        },
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