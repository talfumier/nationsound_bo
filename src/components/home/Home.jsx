import archi from "../../assets/images/architecture.png";

function Home() {
  return (
    <div className="home">
      <h2>Présentation de l'application</h2>
      <p>
        Cette application ("back-office") est dédiée aux organisateurs du
        festival et constitue l'interface avec la partie "back-end" du site.
      </p>
      <p>
        Elle permet de réaliser la gestion des données (création, suppression,
        mise à jour) présentées aux utilisateurs finaux du site (participants au
        festival).
      </p>
      <img src={archi} alt="architecture de l'application" />
      <h2>Droits d'accès/authentification</h2>
      <p>
        Les utilisateurs doivent avoir les droits requis pour réaliser les
        opérations de création, mise à jour ou suppression de données.
      </p>
      <ul>
        L'obtention de ces privilèges se fait en 2 temps :
        <li>création du compte utilisateur par l'intéressé</li>
        <li>
          validation du compte et attribution des droits par l'administrateur du
          site.
        </li>
      </ul>
    </div>
  );
}

export default Home;
