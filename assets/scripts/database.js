import bizData from  "/assets/database/yelp_business_dataset.json" with { type: "json" };

const viewDatabaseTableBody = document.querySelector(".view-database");
const categoryItemList = document.getElementById("categoryItemList");
const categorySearchInput = document.getElementById("categorySearch");
const categoryAddFilterBtn = document.getElementById("catAddFilter");
const categoryFilterDisplay = document.getElementById("database-subsection-filter");

const lenBizData = bizData.length;
const ATTRIBUTES_TO_DISPLAY = [
			[
				["Price Range", convert_price_range],
				["Accepts Credit Cards", format_credit_card], 
				["Good for Kids", format_good_for_kids],
				["Wheelchair Accessible", format_wheelchair]
			], [
				["Good For", format_good_for],
				["Parking", format_parking_options]
			]
		];


let categoryList = document.querySelectorAll(".item");
let filterCategoriesList = [];
let bizById = {};
let bizCategoricalData = {};
// let bizAttributesData = {};
// let bizStateCount = {};

parse_data();

let searchCategories = ["Food", "Food"]
view_data(searchCategories);

function create_li_element(content, classes=[]) {
	const li = document.createElement("li");
	if (classes.length) {
		li.classList.add(...classes); 
	}
	li.textContent = content;
	return li;
}

function create_p_element(content, classes=[]) {
	const p = document.createElement("p");
	if (classes.length) {
		p.classList.add(...classes); 
	}
	p.textContent = content;
	return p;
}

function parse_data() {
	const fragment = document.createDocumentFragment();
	const ul = document.createElement("ul");
	ul.className = "categoryItems";
	
	bizData.forEach((currentBiz) => {
		bizById[currentBiz.business_id] = currentBiz;
		const bizID = currentBiz.business_id;
		
		currentBiz.categories.forEach(category => {
			if (!bizCategoricalData[category]) {
				bizCategoricalData[category] = [];
				ul.appendChild(create_li_element(category, ["item"]));
			}
			
			bizCategoricalData[category].push(bizID);
		});

		
		const bizAttri = Object.entries(currentBiz.attributes);
	});
	
	fragment.appendChild(ul);
	categoryItemList.appendChild(fragment);
	
	categoryList = document.querySelectorAll(".item");
}

categorySearchInput.addEventListener('input', (e) => {
	const term = e.target.value.toLowerCase().trim();
	
	categoryList.forEach(item => {
		const text = item.textContent.toLowerCase();
		item.style.display = text.includes(term) ? 'block' : 'none';
	});
})

categoryItemList.addEventListener('click', (e) => {
	const categoryClicked = e.target;
	
	if (categoryClicked.tagName === "LI") {
		categorySearchInput.value = categoryClicked.textContent.trim();
	}
});

/**
 * Handles the logic behind searches of the database
 *
 * @param {Array} categorySearchRequirements - Contains the required data to perform a category search
 * @returns {DocumentFragment} A fragment containing the <tr> elements that have passed through the search filter
**/
function search(categorySearchRequirements) {
	const returnSearch = document.createDocumentFragment();
	const [categoryReturnSearch, categoryReturnSet] = category_search(...categorySearchRequirements);
	
	returnSearch.appendChild(categoryReturnSearch);
	return returnSearch;
}

document.addEventListener("DOMContentLoaded", () => {
	categoryAddFilterBtn.addEventListener('click', (e) => {
		const filterToAdd = categorySearchInput.value;
		
		addCategoryFilter(filterToAdd);
	});
});

function view_data(categorySearchData = []) {
  viewDatabaseTableBody.innerHTML = "";
  
  const fragment = document.createDocumentFragment();

  let bizCategories = Object.entries(bizCategoricalData);

  fragment.appendChild(search([bizCategories, categorySearchData]));
  
  viewDatabaseTableBody.appendChild(fragment);
}

function category_search(businessCategories, categorySearchData, tableRows = 10) {
	const fragment = document.createDocumentFragment();
	const rendered = new Set();
	let rowIndex = 1;
	
	businessCategories.forEach(([category, ids]) => {
		if (categorySearchData.length > 0 && !categorySearchData.includes(category)) return;
		
		ids.forEach((id, index) => {
			if (rendered.has(id)) return;
			
			const bizObj = bizById[id];
			fragment.appendChild(create_table_row(rowIndex++, bizObj)); 
			rendered.add(id);
		});
	});
	
	return [fragment, rendered];
}

function create_table_row(index, biz) {
	const fragment = document.createDocumentFragment();

    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.textContent = index;
    tr.appendChild(tdIndex);

    const tdInfo = document.createElement("td");
    const h2Name = document.createElement("h2");
    h2Name.className = "minor-title";
    h2Name.textContent = biz.name;
    
    const h4Address = document.createElement("h4");
    h4Address.className = "paragraph";
    h4Address.textContent = biz.full_address;
    
    tdInfo.append(h2Name, h4Address);
    tr.appendChild(tdInfo);

    const tdHours = document.createElement("td");
    const h3Title = document.createElement("h3");
    h3Title.className = "minor-title";
    h3Title.textContent = "Business Hours";
    
    const ulHours = document.createElement("ul");
    ulHours.className = "paragraph";
    
    ulHours.appendChild(format_business_hours(biz.hours));
    
    tdHours.append(h3Title, ulHours);
    tr.appendChild(tdHours);

    const bizAttributes = format_attributes(biz.attributes);
    tr.appendChild(bizAttributes);

    fragment.appendChild(tr);
    
    return fragment;
}

function format_business_hours(businessHours) {
	const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	let fragment = document.createDocumentFragment();
	let startDay = DAYS[0];
	
	if (!businessHours) return create_li_element("Closed/No Data", ["paragraph"]);
	
	for (let i = 0; i < DAYS.length; i++) {
		const currentDay = DAYS[i];
		const nextDay = DAYS[i+1];
		
		let currentDayHours = businessHours[currentDay] ? `${businessHours[currentDay]["open"]}-${businessHours[currentDay]["close"]}`: "Closed";
		const nextDayHours = businessHours[nextDay] ? `${businessHours[nextDay]["open"]}-${businessHours[nextDay]["close"]}` : (nextDay ? "Closed" : null);
		
		if (currentDayHours !== nextDayHours) {
			const setRange = startDay === currentDay ? startDay : `${startDay}-${currentDay}`;
			if (currentDayHours === "00:00-00:00") currentDayHours = "24-hour Service";
			fragment.appendChild(create_li_element(`${setRange}: ${currentDayHours}`, ["paragraph"]));
			startDay = nextDay;
		}
	}
	
	return fragment;
}

function format_attributes(businessAttributes) {
	const fragment = document.createDocumentFragment();
	const td = document.createElement("td");
	
	const attributesSectionOne = ATTRIBUTES_TO_DISPLAY[0];
	const attributesSectionTwo = ATTRIBUTES_TO_DISPLAY[1];
	
	const h3 = document.createElement("h3");
	h3.className = "minor-title";
	h3.textContent = "Business Attributes";
	td.appendChild(h3);
	
	attributesSectionOne.forEach(([attribute, attribute_function]) => {
		if (!businessAttributes[attribute]) return;
		
		td.appendChild(attribute_function(businessAttributes[attribute]));
	});
	
	fragment.appendChild(td);
	const td2 = document.createElement("td");
	
	attributesSectionTwo.forEach(([attribute, attribute_function]) => {
		if (!businessAttributes[attribute]) return;
		
		td2.appendChild(attribute_function(businessAttributes[attribute]));
	});
	
	fragment.appendChild(td2);
	
	return fragment;
}

function convert_price_range(priceRange) {
	const PRICE_LABELS = { "1": "Cheap", "2": "Moderate", "3": "Pricey", "4": "Expensive" };
	
	if (!priceRange) return;
	
	return create_p_element(`Price: ${PRICE_LABELS[priceRange]}`, ["paragraph"]);
}

function format_credit_card(acceptsCreditCards) {
	if (acceptsCreditCards) {
		return create_p_element("Accepts Credit Cards", ["paragraph"]);
	}
	
	return create_p_element("Doesn't Accept Credit Cards", ["paragraph"]);
}

function format_good_for_kids(goodForKids) {
	if (goodForKids) {
		return create_p_element("Good For Kids!", ["paragraph"])
	}
}

function format_wheelchair(wheelchairFriendly) {
	if (wheelchairFriendly) return create_p_element("Wheelchair Accessible!", ["paragraph"]);
}

function format_good_for(goodFor) {
	const goodForEntries = Object.entries(goodFor);
	
	const fragment = document.createDocumentFragment();
	const h3 = document.createElement("h3");
	h3.className = "minor-title";
	h3.textContent = "Great For";
	const ul = document.createElement("ul");
	
	let headerAdded = false;
	
	goodForEntries.forEach(([key, bool]) => {
		if (bool) {
			if (!headerAdded) {
				headerAdded = true;
				fragment.appendChild(h3);
			}
			
			ul.appendChild(create_li_element(`${key}`, ["paragraph"]));
		}
	});
	
	fragment.appendChild(ul);
	
	return fragment;
}

function format_parking_options(parkingOptions) {
	const parkingData = Object.entries(parkingOptions);
	
	const fragment = document.createDocumentFragment();
	const ul = document.createElement("ul");
	const h3 = document.createElement("h3");
	h3.className = "minor-title";
	h3.textContent = "Parking"
	
	const alt_h3 = document.createElement("h3");
	alt_h3.className = "minor-title";
	alt_h3.textContent = "No Parking";
	
	let parkingHeaderAdded = false;
	parkingData.forEach(([parking_type, available]) => {
		if (available) {
			if (!parkingHeaderAdded) {
				parkingHeaderAdded = true;
				fragment.appendChild(h3);
			}
			
			ul.appendChild(create_li_element(`${parking_type}`, ["paragraph"]));
		}
	});
	
	if (!parkingHeaderAdded) {
		fragment.appendChild(alt_h3);
	} else { fragment.appendChild(ul); }
	
	return fragment;
}

/**
 * Adds a category to current category filters
 *
 *@param {string} newFilter - The new filter that needs to be added
 *@returns {boolean} Returns bollean representing a failure or success of adding the filter
**/
function addCategoryFilter(newFilter) {
	if (!bizCategoricalData[newFilter]) {
		return false
	}
	
	filterCategoriesList.push(newFilter);
	
	rerenderCategoryFilters();
}

function rerenderCategoryFilters() {
	categoryFilterDisplay.innerHTML = '';
	
	const fragment = document.createDocumentFragment();
	
	filterCategoriesList.forEach(category => {
		const div = document.createElement("div");
		div.className = "filters";
		
		const p = document.createElement("p");
		p.textContent = category;
		
		div.appendChild(p);
		
		fragment.appendChild(div);
	});
	
	categoryFilterDisplay.appendChild(fragment);
}