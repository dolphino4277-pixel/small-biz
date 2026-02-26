import bizData from  "/small-biz/assets/database/yelp_business_dataset.json" with { type: "json" };

const viewDatabaseDiv = document.querySelector(".view-database");

const lenBizData = bizData.length;

let bizNameData = new Array(lenBizData);

function parse_data() {
  for (let bizIndex = 0; bizIndex < lenBizData; bizIndex++) {
    bizNameData[bizIndex] = bizData[bizIndex].name;
  }
}

function view_data() {
  const table = document.createElement("table");

  for (let bizIndex = 0; bizIndex < lenBizData; bizIndex++) {
    const rowHTML = `
      <tr>
        <td>${bizIndex + 1}</td>
        <td>${bizNameData[bizIndex]}</td>
      </tr>
    `

    table.insertAdjacentHTML("beforeend", rowHTML);
  }

  viewDatabaseDiv.appendChild(table);
}

parse_data();

view_data();
