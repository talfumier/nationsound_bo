import data from "./data.json";

function LegalNotice() {
  const browsers = [
    {
      browser: "Google Chrome",
      link: "https://support.google.com/chrome/answer/95647?hl=fr",
    },
    {
      browser: "Mozilla Firefox",
      link: "https://support.mozilla.org/fr/kb/activer-desactiver-cookies",
    },
    {
      browser: "Safari",
      link: "https://support.apple.com/kb/PH17191?viewlocale=fr_FR&locale=en_US",
    },
    {
      browser: "Opera",
      link: "http://help.opera.com/Windows/10.20/fr/cookies.html",
    },
    {
      browser: "Internet Explorer",
      link: "https://support.microsoft.com/fr-fr/help/17442/windows-internet-explorer-delete-manage-cookies#ie=ie-11",
    },
  ];
  return (
    <div className="legal-notice">
      <ol>
        {Object.keys(data).map((key, idx) => {
          return (
            <li key={idx} className="h2">
              <h2>{data[key].title}</h2>
              <ul>
                {idx !== 0 &&
                  idx !== 2 &&
                  data[key].text.map((par, idx) => {
                    return <li key={idx}>{par}</li>;
                  })}
                {idx === 0 && (
                  <Address
                    title="ht consultant"
                    address="4, impasse du pigeonnier - 31330 Larra"
                    phone={null}
                    contact="henri.talfumier@gmail.com"
                  ></Address>
                )}
                {idx === 2 && (
                  <Address
                    title="Live Events"
                    address="51, rue du Festival - 75000 Paris"
                    phone="01 23 45 67 89"
                    contact="contact@live-events.com"
                  ></Address>
                )}
              </ul>
            </li>
          );
        })}
        <div className="browser">
          {browsers.map((item) => {
            return (
              <a href={item.link} target="_blank">
                {item.browser}
              </a>
            );
          })}
        </div>
      </ol>
    </div>
  );
}

export default LegalNotice;

function Address({title, address, phone, contact}) {
  return (
    <div className="address">
      <p>
        <strong>{title}</strong>
      </p>
      <address>
        {address}
        {phone && (
          <div className="phone-email">
            <i className="fa-solid fa-phone"></i>
            {phone}
          </div>
        )}
        {contact && (
          <div className="phone-email">
            <i className="fa-solid fa-envelope"></i>
            <a href={`mailTo:${contact}`}>{contact}</a>
          </div>
        )}
      </address>
    </div>
  );
}
