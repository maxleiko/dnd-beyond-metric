const CONVERTED = 'data-metrics-converted';

const DISTANCE_NUMBER = '.ddbc-distance-number';
const ATTACK_RANGE = '.ddbc-combat-attack__range-value';
const WEIGHT = '.ddbc-weight-number';
const CONTAINER_WEIGHT_CAP = '.ct-equipment__container-weight-capacity';

const KNOWN_DISTANCES = {
  '3.0': '3',
  '9.1': '9',
  '6.1': '6',
  '4.6': '4.5',
  '37': '36',
};

const REG_FEET = /(\d+)[ -](ft|feet|foot)/g;
const REG_FEET_REPLACER = (_: string, distance: string) => `${feetToMeters(distance)} m`;
const REG_MILE = /(\d+) mile/g;
const REG_MILE_REPLACER = (_: string, distance: string) => `${mileToKilometers(distance)} km`;
const REG_POUNDS = /(\d+(\.\d+)?) lb/g;
const REG_POUNDS_REPLACER = (_0: string, weight: string, _1: string) => {
  const [unit, value] = poundsToKilograms(weight);
  return `${value} ${unit}`;
};

function ifNecessary(fn: (el: HTMLElement) => boolean | undefined) {
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
  const feet = parseFloat(value);
  const meters = (Math.floor((feet / 3.2808) * 1000) / 1000).toPrecision(2);
  const known = KNOWN_DISTANCES[meters];
  return `${known ?? meters}`;
}

function mileToKilometers(value: string): string {
  const mile = parseFloat(value);
  return (mile * 1.609).toPrecision(2);
}

function poundsToKilograms(value: string): readonly [string, string] {
  const pounds = parseFloat(value);
  const kg = pounds * 0.453592;
  if (kg < 1) {
    return ['g', `${Math.floor(kg * 1000)}`];
  }
  return ['kg', `${Math.floor(kg)}`];
}

function updateDistanceNumber(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(DISTANCE_NUMBER).forEach(
    ifNecessary((el) => {
      const labelEl = el.querySelector(`${DISTANCE_NUMBER}__label`);
      const numberEl = el.querySelector(`${DISTANCE_NUMBER}__number`);
      if (labelEl && numberEl) {
        labelEl.innerHTML = 'm';
        numberEl.innerHTML = feetToMeters(numberEl.innerHTML);
        return true;
      }
    }),
  );
}

function updateAttackRange(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ATTACK_RANGE).forEach(
    ifNecessary((el) => {
      const closeEl = el.querySelector(`${ATTACK_RANGE}-close`);
      const longEl = el.querySelector(`${ATTACK_RANGE}-long`);
      if (closeEl && longEl) {
        closeEl.innerHTML = feetToMeters(closeEl.innerHTML);
        longEl.innerHTML = `(${feetToMeters(longEl.innerHTML.trim().slice(1, -1))})`;
        return true;
      }
    }),
  );
}

function updateWeight(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(WEIGHT).forEach(
    ifNecessary((el) => {
      const labelEl = el.querySelector(`${WEIGHT}__label`);
      const numberEl = el.querySelector(`${WEIGHT}__number`);
      if (labelEl && numberEl) {
        const [unit, value] = poundsToKilograms(numberEl.innerHTML);
        labelEl.innerHTML = unit;
        numberEl.innerHTML = value;
        return true;
      }
    }),
  );
}

function updateWeightCapacity(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(CONTAINER_WEIGHT_CAP).forEach(
    ifNecessary((el) => {
      const raw = el.innerHTML.trim().slice(1, -1);
      const [curr, total_raw] = raw.split('/');
      const total_matches = total_raw.match(/\d+/);
      if (total_matches) {
        const [, curr_val] = poundsToKilograms(curr);
        const [total_unit, total_val] = poundsToKilograms(total_matches[0]);
        el.innerHTML = `(${curr_val}/${total_val} ${total_unit})`;
        return true;
      }
    }),
  );
}

function updateParagraph(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('p').forEach(
    ifNecessary((el) => {
      const converted = el.innerHTML
        .replaceAll(REG_FEET, REG_FEET_REPLACER)
        .replaceAll(REG_MILE, REG_MILE_REPLACER)
        .replaceAll(REG_POUNDS, REG_POUNDS_REPLACER);
      const updated = converted !== el.innerHTML;
      el.innerHTML = converted;
      return updated;
    }),
  );
}

function update() {
  try {
    const roots = document.querySelectorAll<HTMLElement>(
      '.ct-character-sheet, .ct-sidebar__portal',
    );

    roots.forEach((root) => {
      updateDistanceNumber(root);
      updateAttackRange(root);
      updateWeight(root);
      updateWeightCapacity(root);
      updateParagraph(root);
    });
  } catch (err) {
    console.error(`D&D Beyong Metric error:`, err);
  }
}

function activate() {
  console.log(`D&D Beyond Metric is loaded: ${new Date().toISOString()}`);

  setInterval(update, 100);
  update();
}

activate();
