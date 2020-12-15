
#  Systemudvikling 3. semester

Dette repository indeholder vores samlede besvarelse af eksamensopgaven, stillet i fagene _"Systemudvikling"_ på datamatikeruddannelsens 3. semester.

## Informationer

-   **Sted:**  [EASJ](https://www.easj.dk/ "EASJ's Hjemmeside"), Roskilde.
-   **Undervisere:**  Vibeke Sandau
-   **Udarbejdet af:** Michelle Dam Kristensen, Morten Jakobsen Møller, Benjamin Curovic og Lukas Jürs Schmidt
-   **Hold ID:**  rf19da2c3-3c.
-   **Rest API:**  https://mort-typescript.azurewebsites.net/ | https://github.com/Mort094/KUBikes

## Før at du kan køre programmet forventer vi at

Du har brug for en nylig installation af [Node.js](https://nodejs.org/) på din computer og [git](https://git-scm.com/), hvis du vil let kunne følge vores installations guide. om opsætning af programmet.

  

### Git Clone

Først og fremmest skal du clone vores projekt sådan at du har mulighed for at kunne gøre programmet på din egen computer.
Den måde du kan gøre dette på er ved at copy paste, koden nedeunder i en terminal.

```console

git clone https://github.com/Mort094/KUBike_TypeScript KUBike

```
Der efter går du ind i folderen der er blevet lavet og installere alle node modules.

```console

cd KUBike/
npm install

```
### Det eneste du mangler er at starte programmet :)

Du kan starte programmet ved at bruge funktionen watch.

```console

npm run watch

```
Hvis du har gjort alt rigtig vil du få en beskrivelse der fortæller dig hvilket port hjemmesiden køre henne. som set i eksemplet nedenstående.

  

### Deployment

When your project is ready for deployment you should use webpack in production mode by writing this in the console

```console

 Access URLs:
-------------------------------------
 Local: 	http://localhost:3000
 External: 	http://192.168.56.1:3000
-------------------------------------
```

## Opgave Beskrivlese

### Kunden 

Københavns universitet ønsker et  cykelsystem, KU-Bikes, til at hjælpe deres studerende og ansatte med at komme fra en afdeling af universitetet til en anden. Til dette formål installeres en Raspberry Pi i cyklen, til at spore GPS-koordinaterne på cyklerne.

 Der skal være mulighed for at se cyklernes placering på et kort som f.eks. Google Maps, hvilket vil give en administrator af systemet mulighed for at se placeringen af samtlige cykler i systemet.

### Brugeren

Brugerne af systemet skal have mulighed for at logge ind i systemet. Ved lån af en cykel vil en bruger scanne en QR-kode på cyklen, hvilket vil tillade cyklens Raspberry Pi at registrere brugeren af cyklen samt tidspunktet for påbegyndt tur til en database. 

Databasen vil ydermere registrere cykler der er placeret væk fra universiteternes bygninger, samt cykler der ikke har været bruget i minimum syv dage.

Efter registrering af en bruger til en bestemt cykel, vil cyklen blive låst op og være klar til brug. Ved afslutning af tur scanner brugeren af cyklen igen QR-koden, hvilket vil registrere  tidspunkt og placering ved afslutning af turen til databasen, og låse cyklen.

### Administrator 

En administrator af systemet vil have mulighed for at opdatere listen af cykler, ved at tilføje nye cykler og slette cykler fra systemet. En administrator vil også have mulighed for at nulstille placeringen af cykler, ved indhentning af cykler der er placeret væk fra universitetets bygninger, samt cykler der ikke har været benyttet i minimum syv dage.
