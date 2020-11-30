import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";


let baseCycleUrl: string = "https://mort-rest.azurewebsites.net/api/cycles/"
let baseUserUrl: string = "https://mort-rest.azurewebsites.net/api/users/"

interface ICycle {
    cycle_id: number
    cycle_name: string
    cycle_coordinates: string
    fk_cycle_status_id: number
}
interface IUser {
    user_id: number
    user_email: string
    user_password: string
    user_firstname: string
    user_lastname: string
    user_mobile: number
    fk_account_status_id: number
}
new Vue({
    el: "#app",
    data: {
        loggedIn: false,
        loginPage: true,
        createUserPage: false,
        overviewPage: false,
        cyclePage: true,
        cycle_id: 1,
        singleCycle: null,
        loginEmail: "",
        loginPassword: "",
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0 },
        errorMessage: "",
        addMessage: "",
        cycles: []
    }, created(){
        console.log(window.location.search)
        this.getOneBike(this.cycle_id)
    },
    methods: {
        login() {
            if (this.loginEmail == "test" && this.loginPassword == "test") { //axios get
                this.loggedIn = true
            } else {
                this.errorMessage = "Wrong"
            }

        },
        loginTry(vendor: string) {
            this.LoginHelpAndShow(baseUserUrl + this.loginEmail + '/' + this.loginPassword)
        },
        LoginHelpAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<IUser[]>(url)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.loggedIn = response.data
                    this.user_email = this.loginEmail
                    console.log(`Denne bruger email er blevet logget ind "${this.user_email}" `)
                })
                .catch((error: AxiosError) => {
                    this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        logout() {
            this.loggedIn = false
        }, createPage() {
            this.createUserPage = true
            this.loginPage = false

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
            this.helperGetAndShow(baseCycleUrl)
        },
        getOneBike(id: number) {
            let urlGet = baseCycleUrl + id
            axios.get<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.singleCycle = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },
        addUser() {
            axios.post<IUser>(baseUserUrl, this.addData)
                .then((response: AxiosResponse) => {
                    let message: string = "response " + response.status + " " + response.statusText
                    this.addMessage = message

                })
                .catch((error: AxiosError) => {
                    // this.addMessage = error.message
                    alert(error.message)
                })
        },
    }
})