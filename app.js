const $ = (id) => document.getElementById(id);

const cities = {
  "Buenos Aires": { lat: -34.6037, lon: -58.3816, region: "Argentina · Región Pampeana" },
  "Córdoba": { lat: -31.4201, lon: -64.1888, region: "Argentina · Región Centro" },
  "Bariloche": { lat: -41.1335, lon: -71.3103, region: "Argentina · Patagonia" },
  "Rosario": { lat: -32.9468, lon: -60.6393, region: "Argentina · Litoral" },
  "Miramar": { lat: -38.2713, lon: -57.8395, region: "Buenos Aires · Costa Atlántica" }
};

const weatherCodes = {
  0:["Despejado","☀"],1:["Mayormente despejado","🌤"],2:["Parcialmente nublado","⛅"],
  3:["Nublado","☁"],45:["Niebla","🌫"],48:["Niebla con escarcha","🌫"],
  51:["Llovizna débil","🌦"],53:["Llovizna moderada","🌦"],55:["Llovizna intensa","🌧"],
  56:["Llovizna helada débil","🌧"],57:["Llovizna helada intensa","🌧"],
  61:["Lluvia débil","🌦"],63:["Lluvia moderada","🌧"],65:["Lluvia intensa","🌧"],
  66:["Lluvia helada débil","🌧"],67:["Lluvia helada intensa","🌧"],
  71:["Nevada débil","🌨"],73:["Nevada moderada","🌨"],75:["Nevada intensa","❄"],
  77:["Granulado de nieve","🌨"],80:["Chaparrones débiles","🌦"],81:["Chaparrones moderados","🌧"],
  82:["Chaparrones fuertes","⛈"],85:["Nevadas débiles","🌨"],86:["Nevadas fuertes","❄"],
  95:["Tormenta","⛈"],96:["Tormenta con granizo","⛈"],99:["Tormenta fuerte con granizo","⛈"]
};

function weatherInfo(code){ return weatherCodes[code] || ["Condición variable","🌤"]; }
function formatDay(dateString, index){
  if(index===0) return "Hoy";
  return new Intl.DateTimeFormat("es-AR",{weekday:"short",timeZone:"UTC"}).format(new Date(dateString+"T12:00:00")).replace(".","");
}
function formatTime(value){
  if(!value) return "—";
  const d=new Date(value);
  return new Intl.DateTimeFormat("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
}
function setNotice(message, isError=false){
  $("notice").textContent=message;
  $("notice").style.color=isError ? "#a94d42" : "";
}

async function loadWeather(city){
  const place=cities[city];
  if(!place) return;
  $("cityName").textContent=city;
  $("regionName").textContent=place.region;
  $("condition").textContent="Cargando datos actuales…";
  setNotice("Conectando con el servicio meteorológico…");
  const params=new URLSearchParams({
    latitude:place.lat, longitude:place.lon,
    current:"temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily:"weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    forecast_days:"6", timezone:"auto"
  });
  try{
    const response=await fetch("https://api.open-meteo.com/v1/forecast?"+params.toString());
    if(!response.ok) throw new Error("El servicio meteorológico respondió con un error.");
    const result=await response.json();
    const c=result.current, d=result.daily;
    const [condition,symbol]=weatherInfo(c.weather_code);
    $("currentTemp").textContent=Math.round(c.temperature_2m);
    $("weatherSymbol").textContent=symbol;
    $("condition").textContent=condition;
    $("feels").textContent=Math.round(c.apparent_temperature)+"°";
    $("humidity").textContent=Math.round(c.relative_humidity_2m)+"%";
    $("humidityBar").style.width=Math.max(0,Math.min(100,c.relative_humidity_2m))+"%";
    $("wind").textContent=Math.round(c.wind_speed_10m);
    const rain=d.precipitation_probability_max?.[0] ?? 0;
    $("rain").textContent=rain+"%";
    $("rainBar").style.width=Math.max(0,Math.min(100,rain))+"%";
    $("sunrise").textContent=formatTime(d.sunrise?.[0]);
    $("sunset").textContent=formatTime(d.sunset?.[0]);
    $("high").textContent=Math.round(d.temperature_2m_max[0])+"°";
    $("low").textContent=Math.round(d.temperature_2m_min[0])+"°";
    const days=d.time.map((date,i)=>{
      const [label,icon]=weatherInfo(d.weather_code[i]);
      return {day:formatDay(date,i),icon,label,high:Math.round(d.temperature_2m_max[i]),low:Math.round(d.temperature_2m_min[i])};
    });
    renderForecast(days);
    const updated=new Intl.DateTimeFormat("es-AR",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}).format(new Date());
    setNotice("Datos reales de Open-Meteo · Actualizado: "+updated+". El pronóstico se renueva al cambiar de ciudad o al tocar «Actualizar».");
  }catch(error){
    console.error(error);
    setNotice("No se pudieron cargar los datos en este momento. Revisá tu conexión e intentá actualizar.",true);
    $("condition").textContent="Datos no disponibles";
  }
}

function renderForecast(days){
  $("forecastList").innerHTML=days.map(day=>`
    <article class="day-card">
      <div class="day-name">${day.day}</div><div class="day-icon" aria-hidden="true">${day.icon}</div>
      <div class="day-label">${day.label}</div>
      <div class="day-temps"><span>${day.high}°</span><span>${day.low}°</span></div>
    </article>`).join("");
  const maxValue=Math.max(...days.map(d=>d.high),1);
  const minValue=Math.min(...days.map(d=>d.low),0);
  const range=Math.max(maxValue-minValue,1);
  $("temperatureChart").querySelector(".chart-bars").innerHTML=days.map(d=>{
    const highHeight=28+((d.high-minValue)/range)*64;
    const lowHeight=18+((d.low-minValue)/range)*48;
    return `<div class="bar-pair" title="${d.day}: máxima ${d.high}°, mínima ${d.low}°"><i class="max-bar" style="height:${highHeight}%"></i><i class="min-bar" style="height:${lowHeight}%"></i></div>`;
  }).join("");
  $("temperatureChart").querySelector(".chart-labels").innerHTML=days.map(d=>`<span>${d.day}</span>`).join("");
}

async function loadSkills(){
  try{
    const response=await fetch("data.json");
    const data=await response.json();
    $("skillsBody").innerHTML=data.skills.map(skill=>`
      <tr><td>${skill.category}<br><span style="font-weight:500;color:#789092">${skill.name}</span></td>
      <td><a class="repo-link" href="${skill.repo}" target="_blank" rel="noopener noreferrer">Abrir repositorio ↗</a></td>
      <td>${skill.description}</td>
      <td><div class="mini-example">${skill.sample}</div><p style="margin:7px 0 0">${skill.example}</p></td></tr>`).join("");
  }catch(e){ console.error("No se pudieron cargar los skills",e); }
}

$("citySelect").addEventListener("change",e=>loadWeather(e.target.value));
const updateButton=document.createElement("button");
updateButton.type="button";
updateButton.className="weather-refresh";
updateButton.textContent="↻ Actualizar clima";
updateButton.addEventListener("click",()=>loadWeather($("citySelect").value));
const picker=$("citySelect").parentElement;
picker.appendChild(updateButton);
loadWeather($("citySelect").value || "Buenos Aires");
setInterval(()=>loadWeather($("citySelect").value || "Buenos Aires"),15*60*1000);
loadSkills();
