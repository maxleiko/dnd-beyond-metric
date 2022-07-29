const CONVERTED = 'data-metrics-converted';

const DISTANCE_NUMBER = '.ddbc-distance-number';
const ATTACK_RANGE = '.ddbc-combat-attack__range-value';
const WEIGHT = '.ddbc-weight-number';
const CONTAINER_WEIGHT_CAP = '.ct-equipment__container-weight-capacity';

function ifNecessary(fn: (el: HTMLElement) => boolean) {
  return (el: HTMLElement) => {
    if (el.getAttribute(CONVERTED) === 'true') {
      return;
    }
    if (fn(el)) {
      el.setAttribute(CONVERTED, 'true');
    }
  };
}

function feetToMeters(value: string): string {
  const feet = parseInt(value, 10);
  return `${Math.floor(feet / 3.2808)}`;
}

function poundsToKilograms(value: string): readonly [string, string] {
  const pounds = parseInt(value, 10);
  const kg = pounds * 0.453592;
  if (kg < 1) {
    return ['g', `${Math.floor(kg * 1000)}`];
  }
  return ['kg', `${Math.floor(kg)}`];
}

function update() {
  // distance-number
  document.querySelectorAll<HTMLElement>(DISTANCE_NUMBER).forEach(
    ifNecessary((el) => {
      const labelEl = el.querySelector(`${DISTANCE_NUMBER}__label`);
      const numberEl = el.querySelector(`${DISTANCE_NUMBER}__number`);
      labelEl.innerHTML = 'm';
      numberEl.innerHTML = feetToMeters(numberEl.innerHTML);
      return true;
    }),
  );

  // attack-range
  document.querySelectorAll(ATTACK_RANGE).forEach(
    ifNecessary((el) => {
      const closeEl = el.querySelector(`${ATTACK_RANGE}-close`);
      const longEl = el.querySelector(`${ATTACK_RANGE}-long`);
      closeEl.innerHTML = feetToMeters(closeEl.innerHTML);
      longEl.innerHTML = `(${feetToMeters(longEl.innerHTML.trim().slice(1, -1))})`;
      return true;
    }),
  );

  // weight
  document.querySelectorAll(WEIGHT).forEach(
    ifNecessary((el) => {
      const labelEl = el.querySelector(`${WEIGHT}__label`);
      const numberEl = el.querySelector(`${WEIGHT}__number`);
      const [unit, value] = poundsToKilograms(numberEl.innerHTML);
      labelEl.innerHTML = unit;
      numberEl.innerHTML = value;
      return true;
    }),
  );

  // weight capacity
  document.querySelectorAll(CONTAINER_WEIGHT_CAP).forEach(
    ifNecessary((el) => {
      const raw = el.innerHTML.trim().slice(1, -1);
      const [curr, total_raw] = raw.split('/');
      const [, curr_val] = poundsToKilograms(curr);
      const [total_unit, total_val] = poundsToKilograms(total_raw.match(/\d+/)[0]);
      el.innerHTML = `(${curr_val}/${total_val} ${total_unit})`;
      return true;
    }),
  );

  // overall "\d+ ft."
  // const feetRegex = /(?:(?!\d+ft))(\d+)\s*(ft)(.*)/;
  // document.querySelectorAll('p').forEach(
  //   ifNecessary((el) => {
  //     const matches = el.innerHTML.match(feetRegex);
  //     if (!matches) {
  //       return false;
  //     }
  //     console.log(matches);
  //     return false;
  //   }),
  // );
}

function activate() {
  console.log(`Dnd Beyond Metric is loaded ${new Date().toISOString()}`);

  setInterval(update, 1000);
  update();
}

activate();
