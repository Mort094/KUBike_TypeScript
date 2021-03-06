import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";
//#region Var for validation of login
var mailformat = /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@+k+u+\.+d+k/;
var indholderTal = /[^\D]/;
var indholderBogstaver = /^[a-zA-Z]+$/;
var lengthPasswordvalid = /.{8,}/;
var indholdeStoreBogstaver = /[A-Z]/;
var testfortegn = /[@$!%*#?&]/
var indholder8Tal = /^[0-9]{8}$/;
//#endregion
//#region Base urls used to get information from database through REST and Axios
//The base url for cycles
let baseCycleUrl: string = "https://mort-rest.azurewebsites.net/api/cycles/"
//The base url for users
let baseUserUrl: string = "https://mort-rest.azurewebsites.net/api/users/"
//the base url for trips
let baseTripUrl: string = "https://mort-rest.azurewebsites.net/api/trip/"
//the base url for messages
let baseMessageUrl: string = "https://mort-rest.azurewebsites.net/api/messages/"
//#endregion
//#region Interface
//Used to create objects, so they can be read by the REST. Used for CRUD
interface ICycle {
    cycle_id: number
    cycle_name: string
    cycle_coordinates: string
    fk_cycle_status_id: number
}
//This interface is used for the profile page, where we use get to show and Put to update a user
interface IUser2 {
    user_id: number
    user_email: string
    user_firstname: string
    user_lastname: string
    user_mobile: number
}
interface IUser {
    user_id: number
    user_email: string
    user_password: string
    user_firstname: string
    user_lastname: string
    user_mobile: number
    account_status_id: number
    userQuestionOne: string
    userAnswerOne: string
    userQuestionTwo: string
    userAnswerTwo: string
    userQuestionThree: string
    userAnswerThree: string
}
interface ITrip {
    trip_start: string
    trip_end: string
    trip_map_json: string
    fk_cycle_id: number
    fk_user_id: number
}
interface IMessage {
    messages_Id: number
    messages_user_id: number
    messages_cycle_id: number
    messages_emne: string
    messages_besked: string
    messages_status: number
}

//#endregion
new Vue({
    el: "#app",
    data: {
        //#region Random data, used for different things. 
        center: {
            lat: 40.730610,
            lng: -73.935242
        },
        platform: null,
        apikey: "YRiO3eCm-Zmx_JN3qpZmRtYI1mpaM_eSb6osTJ_zsww",
        // You can get the API KEY from developer.here.com

        helperSelecter: "",
        currentDateWithFormat: "",
        select: '',
        _status: null,
        decodedContent: '',
        singleCycle: null,
        endTime: "",
        selectedUser: "",
        NewCycleName: "",
        //#endregion
        //#region Id's
        CurrentUserId: null,
        SelectedCycle: 0,
        helperCycle: "",
        cycle_id: 0,
        //#endregion
        //#region adm User
        ChosenUserId: 0,
        helperstring: "",
        //#endregion
        //#region CurrentUser These are used to show data on which user is logged in. 
        CurrentUserName: '',
        CurrentLastName: '',
        CurrentEmail: '',
        CurrentPhone: 0,
        //#endregion
        //#region Messages are used to show messages to user, like when they create a user and they are missing something in the password
        errorMessage: '',
        contentCheck: "",
        addMessage: "",
        updateMessage: "",
        //#endregion
        //#region Message for bike 
        messageSubject: "",
        Mresponse: null,
        messageText: "",
        //#endregion
        //#region Pages
        //The are pages. If a page is true, it is shown otherwise it is not
        loginPage: true,
        loggedIn: false,
        //admin
        admin: false,
        ADMCyclePage: false,
        ADMOverviewPage: false,
        ADMSettingsPage: false,
        ADMMessagesPage: false,
        BikeDetailsPage: false,
        //before login
        createUserPage: false,
        //After login
        overviewPage: false,
        cyclePage: false,
        QR_ScanPage: false,
        profilePage: false,
        settingsPage: false,
        Cykellisteside: false,
        updateUserPage: false,
        //#endregion
        //#region Arrays
        //Used to pull out data about stuff in arrays, so they can be show
        cycleDetails: [],
        currentTripId: 0,
        currentTrip: [],
        cycles: [],
        cycles2: [],
        activeBikes: [],
        AllUserTrips: [],
        CyclesInUse: [],
        AllMessages: [],
        AllMessagesBike: [],
        users: [],
        //#endregion
        //#region login
        //Used for the login
        loginEmail: "",
        loginPassword: "",
        ResponseTrip: null,
        //#endregion
        cycle_name: " ",
        //#region Create data
        //These are used when you create and update a thing
        addData: { user_email: "", user_password: "", user_firstname: "", user_lastname: "", user_mobile: 0, userQuestionOne: "", userAnswerOne: "", userQuestionTwo: "", userAnswerTwo: "", userQuestionThree: "", userAnswerThree: "" },
        addTripData: { trip_start: "", trip_end: "", trip_map_json: "", user_id: 0, cycle_id: 0 },
        addTripEnd: { trip_end: "" },
        updateUserData: { User_firstname: "", User_lastname: "", User_email: "", User_mobile: 0 },
        addMessageData: { messages_Id: 0, messages_user_id: 0, cycle_id: 0, Emne: "", Besked: "", status: 0 },
        addCycleData: { cycle_name: "", cycle_coordinates: "" },
        //#endregion
        //Method trying to get google maps to work
        async mounted() {
            declare const window: any;
            // Initialize the platform object:
            const platform = new window.H.service.Platform({
                apikey: this.apikey
            });
            this.platform = platform;
            this.initializeHereMap();
        }
    },
    //Created() is a funtion that runs stuff on pageload. So if a method is placed here, it is run on page load
    created() {
        this.getAllBikes()
        this.cycles
        this.getAllBikesAdmin()
        this.cycles2
        this.GetActiveBikesFromTrip()
        this.CyclesInUse

    },
    methods: {
        initializeHereMap() { // rendering map
            declare const window: any;
            const mapContainer = this.$refs.hereMap;
            const H = window.H;
            // Obtain the default map types from the platform object
            var maptypes = this.platform.createDefaultLayers();

            // Instantiate (and display) a map object:
            var map = new H.Map(mapContainer, maptypes.vector.normal.map, {
                zoom: 10,
                center: this.center
                // center object { lat: 40.730610, lng: -73.935242 }
            });

            addEventListener("resize", () => map.getViewPort().resize());

            // add behavior control
            new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

            // add UI
            H.ui.UI.createDefault(map, maptypes);
            // End rendering the initial map
        },
        //#region Login
        //All these methods in this region helps to login or out 
        login() {
            this.createUserPage = false
            this.loginPage = true
            this.errorMessage = ''
            document.getElementById('login-email').className = "form-control";
        },
        loginTry(vendor: string) {
            // https://regex101.com/r/h7oSha/1
            //Login both fields must not be empty
            if (this.loginPassword == '' && this.loginEmail == '') {
                this.errorMessage = "Du skal skrive dit password og din email";
                document.getElementById('login-password').className = "form-control error";
                document.getElementById('login-email').className = "form-control error";
            }
            else //Password must be filled
            {
                if (this.loginPassword == '') {
                    this.errorMessage = "Du skal skrive et password";
                    document.getElementById('login-password').className = "form-control error";
                    document.getElementById('login-email').className = "form-control";

                } // email must be written
                else if (this.loginEmail == '') {
                    this.errorMessage = "Du skal skrive et en email";
                    document.getElementById('login-password').className = "form-control";
                    document.getElementById('login-email').className = "form-control error";
                }
                else {
                    //Uses the loginHelpAndShow method and HentBruger to login
                    if (this.loginEmail.match(mailformat)) {
                        this.LoginHelpAndShow(baseUserUrl + this.loginEmail + '/' + this.loginPassword)
                        this.HentBruger()
                    }
                    else //Email must be a @ku.dk email
                    {
                        this.errorMessage = "Din mail skal hedde @ku.dk";
                        document.getElementById('login-email').className = "form-control error";
                        document.getElementById('login-password').className = "form-control";
                    }
                }
            }

        },
        //This method gets the information from the Database, and set loggedin = true
        LoginHelpAndShow(url: string) { // helper metode: getAllCar + getByVendor are very similar
            axios.get<IUser[]>(url)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.loggedIn = response.data
                    if (this.loggedIn == true) {
                        this.User_email = this.loginEmail
                        this.loggedIn = response.data
                        this.overviewPage = true
                        //Test if the email is adm@ku.dk, and if it is, it sets admin = true, so an admin is logged in
                        if (this.loginEmail == "adm@ku.dk") {
                            this.admin = true
                        }
                        console.log(`Denne bruger email er blevet logget ind "${this.User_email}" `)
                    }
                    this.errorMessage = "Forkert Email eller Password"
                    //document.getElementById('opret-email').className = "green";
                    document.getElementById('login-password').className = "form-control error";
                    document.getElementById('login-email').className = "form-control error";
                })
                .catch((error: AxiosError) => {
                    error.message = this.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        //When user press logout, it set currentuser id = null, and shows the login page
        logout() {
            this.loggedIn = false
            this.loginPage = true
            this.loginEmail = null
            this.loginPassword = null
            this.CurrentUserId = null
            this.admin = false
        },
        //#endregion
        //#region Pages
        //These methods are used to show the different pages. They are placed on buttons or in other methods to navigate around
        ADMMessagesPageCall() {

            this.ADMOverviewPage = false
            this.ADMCyclePage = false
            this.ADMSettingsPage = false
            this.ADMMessagesPage = true
        },

        createPage() {
            this.createUserPage = true
            this.loginPage = false
            this.errorMessage = ''
        },
        backToLoginPage() {
            this.createUserPage = false
            this.loginPage = true
        },
        ADMUOverviewPage() {
            this.ADMOverviewPage = true
            this.ADMCyclePage = false
            this.ADMSettingsPage = false
            this.getAllUsers()
            this.GetActiveBikes()
            this.activeBikes
        },
        ADMCyclesPage() {
            this.ADMOverviewPage = false
            this.ADMCyclePage = true
            this.ADMSettingsPage = false
        },
        ADMSettingPage() {
            this.ADMOverviewPage = false
            this.ADMCyclePage = false
            this.ADMSettingsPage = true
        },
        OverviewPage() {
            this.settingsPage = false
            this.Cykellisteside = true
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.updateUserPage = false
            this.GetActiveBikes()
            this.activeBikes

        },
        QRPage() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = true
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.GetActiveBikes()
            this.activeBikes
            this.GetActiveBikesFromTrip()
            this.updateUserPage = false
            // setTimeout(() => this.CheckIfBikeIsAvailable().bind(this), 5)
        },


        SpecificCyclePage() {
            if (this.contentCheck == "http://qr.getbike/") {
                this.QR_ScanPage = false
                this.getOneBike()
                this.cyclePage = true
                this.Cykellisteside = false
                this.updateUserPage = false
                this.GetActiveBikes()
                this.activeBikes
            }
            else {
                alert("ikke en gyldig QR")
            }

        },
        Settings() {
            this.settingsPage = true
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.updateUserPage = false
        },
        Profile() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = true
            this.Cykellisteside = false
            this.updateUserPage = false
            this.HentAltOmEnBruger()
        },
        UpdateUserPage() {
            this.settingsPage = false
            this.overviewPage = false
            this.QR_ScanPage = false
            this.cyclePage = false
            this.profilePage = false
            this.Cykellisteside = false
            this.updateUserPage = true
            this.InputFilled()



        },
        //#endregion
        //#region Trip
        //When you start a trip, this method updates the cycle status to 1, so it is being used
        startTrip(_status: 1) {
            //Url request 
            let urlGet = baseCycleUrl + "start/" + this.cycle_id
            //Indsæt PUT-metode 
            axios.put<ICycle>(urlGet)
                //response kaldt
                .then((response: AxiosResponse<ICycle>) => {
                    this.singleCycle = response.data
                })
                //Catch tjekke om der er errors
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            //Den her alert er kaldt, hvis alt går godt
            alert("Tur startet")
        },
        //This Method use post, to create a trip, with the information needed
        opretTrip() {
            //Url request 
            let urlSecond = baseTripUrl
            //Metoden kaldt til at fremkalde times
            this.TimeFunction()
            //Parameter tilføjelse
            this.addTripData.User_id = this.CurrentUserId
            this.addTripData.cycle_id = this.cycle_id
            this.addTripData.trip_map_json = "some map stuff"
            this.addTripData.trip_start = this.currentDateWithFormat
            this.addTripData.trip_end = "Awaiting end"
            //Indsæt POST-metode 
            axios.post<ITrip>(urlSecond, this.addTripData)
                //response kaldt
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.responseTrip = response.data
                }
                )
                //Catch tjekke om der er errors
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
            //Metode kaldt, hvis alt gør godt.
            this.startTrip()
        },

        //Tidsfunktion
        TimeFunction: function () {
            //Varaibler tilføjet igennem en date tostring()
            this.currentDateWithFormat = new Date().toString()
            console.log(this.currentDateWithFormat);
        },
        //This method updates the cycle status to 2, so it is fre
        slutTrip(_status: 2) {
            //getCurrentTrip gør at man kan får fat på den nuværende trip
            this.getCurrentTrip()
            //Url request 
            let urlGet = baseCycleUrl + "slut/" + this.cycle_id
            //this.EndTripTime()
            //If statement der tjekker om cycle_id er i Active Bikes
            if (this.activeBikes.includes(parseInt(this.cycle_id))) {
                //Indsæt PUT-metode 
                axios.put<ICycle>(urlGet)
                    //response kaldt
                    .then((response: AxiosResponse<ICycle>) => {
                        console.log(response.data)
                    })
                    //Catch tjekke om der er errors på respond
                    .catch((error: AxiosError) => {
                        alert(error.message);
                    })
            }
            //Catch error
            else {
                alert("Du er ikke den registrerede bruger af denne cykel")
            }

        },

        //This function ...
        EndTripTime(): void {
            this.TimeFunction()
            this.endTime = this.currentDateWithFormat
            let urlGet = baseTripUrl + "slutTrip/" + this.currentTripId + "?time=" + this.endTime
            this.addTripEnd.trip_end = this.currentDateWithFormat
            console.log('update' + urlGet)
            console.log(this.currentTripId)
            if (this.currentTripId != 0) {
                axios.put<string>(urlGet, this.addTripEnd)
                    .then(response => {
                        console.log(response);
                        alert("afslut registreret")
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            else {
                alert("Du har ikke en aktiv rute på denne cykel.")
            }
        },
        //This method gets a trip, for a current user
        getCurrentTrip() {
            let urlGet = baseTripUrl + "getwithuser/" + this.CurrentUserId + "/" + this.cycle_id
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTripId = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        getCurrentTripEnd() {
            let urlGet = baseTripUrl + "getwithuser/" + this.CurrentUserId + "/" + this.cycle_id
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTripId = response.data
                    this.EndTripTimehelper()

                })
                .catch((error: AxiosError) => {
                    alert(error.message);

                })
        },
        EndTripTimehelper(): void {
            this.TimeFunction()
            this.endTime = this.currentDateWithFormat
            let urlGet = baseTripUrl + "slutTrip/" + this.currentTripId + "?time=" + this.endTime
            this.addTripEnd.trip_end = this.currentDateWithFormat
            console.log('update' + urlGet)
            console.log(this.currentTripId)
            if (this.currentTripId != 0) {
                axios.put<string>(urlGet, this.addTripEnd)
                    .then(response => {
                        console.log(response);
                        alert("afslut registreret")
                        this.slutTrip()
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            else {
                alert("Du har ikke en aktiv rute på denne cykel.")
            }
        },
        //This method gets the full current trip, on a current user
        GetFullCurrentTrip() {
            let urlGet = baseTripUrl + this.currentTripId
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTrip = response.data
                    alert("XXX")
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        //This method gets all active bikes
        GetActiveBikesFromTrip() {
            let urlGet = baseTripUrl + "allecyklerfraruter"
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.CyclesInUse = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        //This method checks if the cycle is available or not
        CheckIfBikeIsAvailableWithoutQR() {
            if (this.CyclesInUse.includes(parseInt(this.cycle_id))) {
                //  x.style.visibility = "visible";
                alert("cykel er i brug")
            }
            else {
                alert("cykel er ledig")
                this.opretTrip();
            }
        },

        CheckIfBikeIsAvailable() {
            var x = document.getElementById("StatButton")
            if (this.CyclesInUse.includes(parseInt(this.cycle_id))) {
                //  x.style.visibility = "visible";
                x.style.visibility = "hidden";
                alert("cykel er i brug")
            }
            else {
                alert("cykel er ledig")
                this.opretTrip();
            }
        },
        //#endregion
        //#region Bruger

        getAllUsers() {
            axios.get<IUser[]>(baseUserUrl)
                .then((response: AxiosResponse<IUser[]>) => {
                    this.users = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        ADMHentUserIDFraSelect() {
            this.helperstring = this.selectedUser
            this.ADMHelperID()
        },
        ADMHelperID() {
            this.ChosenUserId = parseInt(this.helperstring.split(".", 1))
            this.ADMDeleteUser()
        },
        //This method use the chosen user id to delete, but makes an alart to ask if you are sure
        ADMDeleteUser() {
            if (confirm("Do you really want to delete?")) {
                let urlGetUser = baseUserUrl + "delete/" + this.ChosenUserId
                axios.delete<IUser>(urlGetUser)
                    .then
                    ((response: AxiosResponse) => {

                        this.Mresponse = response.data
                        alert("User slettet")
                        this.getAllUsers()
                    }
                    )
                    .catch(
                        (error: AxiosError) => {
                            alert(error.message)
                        }
                    )
            }
        },
        //This method is used to get one user, depending on the login email. Then then set currentuserid to the id matching the email
        HentBruger() {
            let urlGet = baseUserUrl + this.loginEmail
            axios.get<IUser>(urlGet)
                .then((response: AxiosResponse<IUser>) => {
                    this.CurrentUserId = response.data
                    console.log(urlGet)
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })

        },
        //This method updates a user status, so the user cant login
        deactivateUser() {
            if (confirm("Er du sikker på at du vil slette din bruger?")) {
                let urlPut = baseUserUrl + "deactivate/" + parseInt(this.CurrentUserId)
                axios.put<IUser>(urlPut)
                    .then((response: AxiosResponse) => {
                        this.CurrentUserId = response.data
                        this.loggedIn = false
                        this.loginPage = true

                    })
                    .catch((error: AxiosError) => {
                        alert(error.message)
                    })
            }
        },
        //This method is used to the neccesary information about a user, to show on profile page
        HentAltOmEnBruger() {
            let urlGet = baseUserUrl + "user/" + parseInt(this.CurrentUserId)
            axios.get<IUser2>(urlGet)
                .then((response: AxiosResponse<IUser2>) => {
                    this.CurrentUserName = response.data.user_firstname
                    this.CurrentLastName = response.data.user_lastname
                    this.CurrentEmail = response.data.user_email
                    this.CurrentPhone = response.data.user_mobile

                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        //This method is used to get a singler user by their id
        ADMHentBruger() {
            let urlGet = baseUserUrl + "user/" + this.ChosenUserId
            axios.get<IUser>(urlGet)
                .then((response: AxiosResponse<IUser>) => {
                    this.User_id = response.data.user_id
                    this.User_firstname = response.data.user_firstname
                    this.User_email = response.data.user_email
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })

        },
        //This method is used to fill in the information in the input frields the user uses to update his information
        InputFilled() {
            this.HentAltOmEnBruger()
            this.updateUserData.User_firstname = this.CurrentUserName
            this.updateUserData.User_lastname = this.CurrentLastName
            this.updateUserData.User_email = this.CurrentEmail
            this.updateUserData.User_mobile = this.CurrentPhone
        },
        //This method is used to update a user information
        updateUser() {
            let url: string = baseUserUrl + "updateUser/" + parseInt(this.CurrentUserId)
            axios.put<IUser>(url, this.updateUserData)
                .then((response: AxiosResponse) => {
                    let message: string = "response " + response.status + " " + response.statusText
                    this.updateMessage = message
                    this.updateUserPage = false
                    this.profilePage = true
                    this.HentAltOmEnBruger()
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        //This method is used
        TjekBruger() {
            let urlGet = baseTripUrl + "allusertrips/" + this.CurrentUserId
            axios.get<ITrip[]>(urlGet)
                .then((response: AxiosResponse<ITrip[]>) => {
                    this.AllUserTrips = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        //This method is used to create a user. It throws error messages if the criterias arent met
        addUser() {

            var noError = true
            try {
                if (this.addData.user_email == '') throw 'emptyEmail';
                if (this.addData.user_password == '') throw 'emptyPassword';
                if (this.addData.user_firstname == '') throw 'emptyFirstName';
                if (this.addData.user_lastname == '') throw 'emptylastName';
                if (this.addData.user_mobile == '') throw 'emptyMobil';
                if (indholderTal.test(this.addData.user_password)) { }
                else { throw 'nullIntPassword'; }
                if (indholdeStoreBogstaver.test(this.addData.user_password)) { }
                else { throw 'bigStrPassword'; }
                if (indholder8Tal.test(this.addData.user_mobile)) { }
                else { throw '8xIntMobile'; }
                if (testfortegn.test(this.addData.user_password)) { }
                else { throw 'passwordNullSymbol'; }
                if (lengthPasswordvalid.test(this.addData.user_password)) {
                }
                else {
                    throw 'passwordLength';
                }
                if (indholderBogstaver.test(this.addData.user_firstname)) {
                }
                else {
                    throw 'smallStrFirstName';
                }
                if (indholderBogstaver.test(this.addData.user_lastname)) { }
                else {
                    throw 'smallStrLastName';
                }
                if (mailformat.test(this.addData.user_email)) { }
                else { throw 'kuMail'; }
                if (this.addData.user_question_one == '') {
                    alert("no question one data")
                }
            }
            catch (err) {
                var errorNumber = err
                noError = false
            }
            finally {
                if (noError == true) {
                    axios.post<IUser>(baseUserUrl, this.addData)
                        .then
                        (
                            (response: AxiosResponse) => {
                                let message: string = "response " + response.status + " " + response.statusText
                                console.log(message)
                                document.getElementById('opret-email').className = "form-control";
                                document.getElementById('opret-password').className = "form-control";
                                document.getElementById('opret-name').className = "form-control";
                                document.getElementById('opret-lastname').className = "form-control";
                                parseInt(document.getElementById('opret-phone').className = "form-control");
                                document.getElementById('opret-sikkerhedEt');
                                document.getElementById('opret-svarEt');
                                document.getElementById('opret-sikkerhedTo');
                                document.getElementById('opret-svarTo');
                                document.getElementById('opret-sikkerhedTre');
                                document.getElementById('opret-svartre');
                                this.addMessage = null
                                this.loginPage = true
                                this.createUserPage = false
                            }
                        )
                        .catch(
                            (error: AxiosError) => {
                                this.errorMessage = error.message
                                this.errorMessage
                            }
                        )
                }
                else {
                    // Nulstil alle opret class
                    document.getElementById('opret-email').className = "form-control";
                    document.getElementById('opret-password').className = "form-control";
                    document.getElementById('opret-name').className = "form-control";
                    document.getElementById('opret-lastname').className = "form-control";
                    document.getElementById('opret-phone').className = "form-control";
                    // 12
                    if (errorNumber == 'emptyEmail') {
                        this.errorMessage = 'Du skal skrive noget i email';
                        document.getElementById('opret-email').className = "form-control error";
                    }
                    // 11
                    if (errorNumber == 'emptyPassword') {
                        this.errorMessage = 'Du skal skrive et password';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    // 10
                    if (errorNumber == 'emptyFirstName') {
                        this.errorMessage = 'Du skal skrive et fornavn';
                        document.getElementById('opret-name').className = "form-control error";
                    }
                    // 9
                    if (errorNumber == 'emptylastName') {
                        this.errorMessage = 'Du skal skrive et efternavn';
                        document.getElementById('opret-lastname').className = "form-control error";
                    }
                    // 8
                    if (errorNumber == 'emptyMobil') {
                        this.errorMessage = 'Du skal skrive et telefonnummer';
                        document.getElementById('opret-phone').className = "form-control error";
                    }
                    // 7
                    if (errorNumber == 'nullIntPassword') {
                        this.errorMessage = 'Dit password skal indholde tal';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    // 6
                    if (errorNumber == 'bigStrPassword') {
                        this.errorMessage = 'Dit password skal indholde et stort bogstav';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    // 5
                    if (errorNumber == 'smallStrFirstName') {
                        this.errorMessage = 'Dit Navn må kun indholde bogstaver';
                        document.getElementById('opret-name').className = "form-control error";
                    }
                    // 4 
                    if (errorNumber == 'smallStrLastName') {
                        this.errorMessage = 'Dit Efter navn skal indholde bogstaver';
                        document.getElementById('opret-lastname').className = "form-control error";
                    }
                    // 3
                    if (errorNumber == '8xIntMobile') {
                        this.errorMessage = 'Dit telefonnummer skal indholde == 8 tal';
                        document.getElementById('opret-phone').className = "form-control error";
                    }
                    // 2
                    if (errorNumber == 'kuMail') {
                        this.errorMessage = 'Du skal bruge din skole email fx navn@ku.dk';
                        document.getElementById('opret-email').className = "form-control error";
                    }
                    // 1
                    if (errorNumber == 'passwordLength') {
                        this.errorMessage = 'Dit password skal minimum være 8 tegn langt';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    if (errorNumber == 'passwordNullSymbol') {
                        this.errorMessage = 'Dit password skal indholde specialtegn!!!!!';
                        document.getElementById('opret-password').className = "form-control error";
                    }
                    else {

                        console.log(errorNumber)
                    }
                }
            }


        },
        //#endregion
        //#region Bikes
        helperGetAndShow(url: string) {
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles = response.data
                })
                .catch((error: AxiosError) => {
                    //this.message = error.message
                    alert(error.message) // https://www.w3schools.com/js/js_popup.asp
                })
        },
        HentCykelIDFraSelect() {
            this.helperSelecter = this.select
            this.SelectHelper()
        },
        SelectHelper() {
            this.cycle_id = parseInt(this.helperSelecter)
            this.CheckIfBikeIsAvailablewithOutscan()
        },
        CheckIfBikeIsAvailablewithOutscan() {
            var x = document.getElementById("StartUdenSkan")
            if (this.CyclesInUse.includes(parseInt(this.cycle_id))) {
                //  x.style.visibility = "visible";
                x.style.visibility = "hidden";
                alert("cykel er i brug")

            }
            else {
                alert("cykel er ledig")
                this.getCurrentTripSelect();

            }
        },
        getCurrentTripSelect() {
            let urlGet = baseTripUrl + "getwithuser/" + this.CurrentUserId + "/" + this.cycle_id
            axios.get<ITrip>(urlGet)
                .then((response: AxiosResponse<ITrip>) => {
                    this.currentTripId = response.data
                    this.opretTrip()
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },
        HentCykelIDFraSelectEnd() {
            this.currentTripId = 0
            this.getCurrentTripEnd()
        },


        HentCykelIDSelect() {
            this.currentTripId = 0
            this.helperCycle = this.select
            this.getIdHelper()

            //this.getCurrentTrip()
            //this.CheckIfBikeIsAvailableWithoutQR() 
        },


        getIdHelper() {
            this.cycle_id = parseInt(this.helperCycle)
        },
        getAllBikesAdmin() {
            let url = baseCycleUrl + "alle-cykler/"
            axios.get<ICycle[]>(url)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycles2 = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },
        getAllBikes() {
            this.helperGetAndShow(baseCycleUrl)
        },
        getOneBike() {
            if (this.contentCheck == "http://qr.getbike/") {
                let urlGet = baseCycleUrl + this.cycle_id
                axios.get<ICycle>(urlGet)
                    .then((response: AxiosResponse<ICycle>) => {
                        this.singleCycle = response.data
                    })
                    .catch((error: AxiosError) => {
                        alert(error.message)
                    })
                if (this.cycle_id != null) {
                    let urlGet = baseCycleUrl + "ledig/" + this.cycle_id
                    axios.get<ICycle>(urlGet)
                        .then((response: AxiosResponse<ICycle>) => {
                            this.singleCycle = response.data
                        })
                        .catch((error: AxiosError) => {
                            alert("Cykel er ikke ledig")
                        })
                }
                else {
                    alert("ikke en gyldig cykel QR")
                }
            }
            else {
                alert("Ikke en gyldig Cykel QR.");
            }
        },
        GetActiveBikes() {
            let url = baseTripUrl + "allusertrips/" + this.CurrentUserId
            axios.get<ITrip[]>(url)
                .then((response: AxiosResponse<ITrip[]>) => {
                    this.activeBikes = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message);
                })
        },

        ADMAddBike() {
            let urlGet = baseCycleUrl
            this.addCycleData.cycle_name = this.NewCycleName
            this.addCycleData.cycle_coordinates = "New Coordinates"
            axios.post<IMessage>(urlGet, this.addCycleData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    alert("Cykel tilføjet")
                    this.getAllBikesAdmin()
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        ADMDeleteBike() {
            if (confirm("Do you really want to delete?")) {
                let urlGet = baseCycleUrl + parseInt(this.SelectedCycle)
                axios.delete<ICycle>(urlGet)
                    .then
                    ((response: AxiosResponse) => {
                        //this.currentTrip[] = response
                        //sideskift?
                        this.Mresponse = response.data
                        alert("Cykel slettet")
                        this.getAllBikesAdmin()
                    }
                    )
                    .catch(
                        (error: AxiosError) => {
                            alert(error.message)
                        }
                    )
            }
        },


        //#endregion  
        //#region QR code
        onDecode(content: any) {
            this.decodedContent = content
            this.contentCheck = content.substr(0, 18)
            this.cycle_id = content.slice(18)
        },

        onInit(promise: any) {
            promise.then(() => {
                console.log('Successfully initilized! Ready for scanning now!')
            })
                .catch((error: { name: string; message: string; }) => {
                    if (error.name === 'NotAllowedError') {
                        this.errorMessage = 'Hey! I need access to your camera'
                    } else if (error.name === 'NotFoundError') {
                        this.errorMessage = 'Do you even have a camera on your device?'
                    } else if (error.name === 'NotSupportedError') {
                        this.errorMessage = 'Seems like this page is served in non-secure context (HTTPS, localhost or file://)'
                    } else if (error.name === 'NotReadableError') {
                        this.errorMessage = 'Couldn\'t access your camera. Is it already in use?'
                    } else if (error.name === 'OverconstrainedError') {
                        this.errorMessage = 'Constraints don\'t match any installed camera. Did you asked for the front camera although there is none?'
                    } else {
                        this.errorMessage = 'UNKNOWN ERROR: ' + error.message
                    }
                })
        },
        //#endregion
        //#region Bike available/not
        Unavaliable(_status: 1) {
            let urlGet = baseCycleUrl + "start/" + this.select
            // this.opretTrip()
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Unavaliable Now")
        },
        Avaliable(_status: 2) {
            let urlGet = baseCycleUrl + "slut/" + this.select
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
            alert("Avaliable Now")
        },
        //#endregion
        //#region Messages
        opretMessage() {
            let urlSecond = baseMessageUrl
            this.addMessageData.messages_user_id = this.CurrentUserId
            this.addMessageData.messages_cycle_id = parseInt(this.cycle_id)
            this.addMessageData.messages_emne = this.messageSubject
            this.addMessageData.messages_besked = this.messageText
            this.addMessageData.messages_status = 1
            axios.post<IMessage>(urlSecond, this.addMessageData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.Mresponse = response.data
                    alert("Klage oprettet")
                    this.StolenHelper2()
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },
        StolenHelper2(_status: 1) {
            let urlGet = baseCycleUrl + "start/" + this.cycle_id
            // this.opretTrip()
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },

        opretStolen() {
            let urlGet = baseMessageUrl
            this.addMessageData.messages_Id = this.CurrentUserId
            this.addMessageData.messages_cycle_id = parseInt(this.cycle_id)
            this.addMessageData.messages_emne = "STOLEN"
            this.addMessageData.messages_besked = "STOLEN"
            this.addMessageData.messages_status = 4
            axios.post<IMessage>(urlGet, this.addMessageData)
                .then
                ((response: AxiosResponse) => {
                    //this.currentTrip[] = response
                    //sideskift?
                    this.Mresponse = response.data
                    alert("Cykel er meldt væk")
                    this.StolenHelper()
                }
                )
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },
        StolenHelper(_status: 1) {
            let urlGet = baseCycleUrl + "start/" + this.select
            // this.opretTrip()
            axios.put<ICycle>(urlGet)
                .then((response: AxiosResponse<ICycle>) => {
                    this.select = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },

        ADMHentBeskeder() {
            let urlGet = baseMessageUrl
            axios.get<IMessage>(urlGet)
                .then
                ((response: AxiosResponse) => {
                    this.AllMessages = response.data
                    alert("Beskeder hentet")
                })
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )
        },

        ADMHentBeskederCykel() {
            let urlGet = baseMessageUrl + "cykel/" + parseInt(this.select)
            axios.get<IMessage[]>(urlGet)
                .then
                ((response: AxiosResponse<IMessage[]>) => {
                    this.AllMessagesBike = response.data
                    console.log(urlGet)
                })
                .catch(
                    (error: AxiosError) => {
                        alert(error.message)
                    }
                )

        },
        ADMSeCykelDetails() {
            this.helperCycle = this.select
            this.AdmHelperCycleSelectDetails()
        },
        AdmHelperCycleSelectDetails() {
            this.SelectedCycle = parseInt(this.helperCycle)
            this.GetDetails()
        },
        GetDetails() {
            let urlGet = this.baseCycleUrl + this.SelectedCycle
            axios.get<ICycle[]>(urlGet)
                .then((response: AxiosResponse<ICycle[]>) => {
                    this.cycleDetails = response.data
                })
                .catch((error: AxiosError) => {
                    alert(error.message)
                })
        },

        ADMHentCykelIDFraSelect() {
            this.helperCycle = this.select
            this.AdmHelperCycleSelectDelete()

        },
        AdmHelperCycleSelectDelete() {
            this.SelectedCycle = parseInt(this.helperCycle)
            this.ADMDeleteBike()
        }

        //#endregion
    },

})

