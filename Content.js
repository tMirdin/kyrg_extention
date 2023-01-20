// Страница ждет полной загрузи и только потом пдключается код Расширения

window.addEventListener('load', function () {
  // Объект replacements представляет собой все возможные варианты написания слов для их последующей замены в формате "Ключ": "Значение". Где ключи - слово которое необходимо заменить,а значение - слово на которое нужно произвести замену. Для добавления новых вариантов слов для обработки в расширении и их замены, нужно всего лишь добавлять новые пары в этот объект в таком же формате ключа и значения. Дальше код динамически проходится по всем парам в обоъекте и производит замену на странице.
  // const replacements = {
  //   Киргизия: 'Кыргызстан',
  //   Киргизстан: 'Кыргызстан',
  //   киргизия: 'Кыргызстан',
  //   кыргызия: 'Кыргызстан',
  //   киргиз: 'кыргыз',
  //   Киргиз: 'Кыргыз',
  //   киргизский: 'кыргызский',
  //   Киргизский: 'кыргызский',
  //   Киргизии: 'Кыргызстана',
  // };

  // Ниже закомментирован вариант исполнения обекта с уже более расширенным словарем

  const replacements = {
    // Названия страны
    Киргизия: 'Кыргызстан',
    Кирги́зия: 'Кыргызстан',
    Кирги́зская: 'Кыргызская',
    кирги́зия: 'Кыргызстан',
    Киргизстан: 'Кыргызстан',
    киргизия: 'Кыргызстан',
    кыргызия: 'Кыргызстан',
    Киргизию: 'Кыргызстан',
    Киргизией: 'Кыргызстаном',
    Киргизии: 'Кыргызстан',
    КИРГИЗИЯ: 'КЫРГЫЗСТАН',

    Киргизией: 'Кыргызстаном',
    Киргизию: 'Кыргызстан',
    // Названия национальности
    киргиз: 'кыргыз',
    Киргиз: 'Кыргыз',
    КИРГИЗ: 'КЫРГЫЗ',
    киргизский: 'кыргызский',
    Киргизский: 'Кыргызский',

    Киргизу: 'Кыргызу',
    Киргиза: 'Кыргыза',
    Киргизом: 'Кыргызом',
    Киргизов: 'Кыргызов',
    Киргизам: 'Кыргызам',

    киргизу: 'кыргызу',
    киргиза: 'кыргыза',
    киргизом: 'кыргызом',
    киргизов: 'кыргызов',
    киргизам: 'кыргызам',

    киргизского: 'кыргызского',
    Киргизского: 'Кыргызского',
    КИРГИЗСКОГО: 'КЫРГЫЗСКОГО',
    Киргизская: 'Кыргызская',
    киргизском: 'кыргызском',
    Киргизской: 'Кыргызской',
    киргизской: 'кыргызской',
    Киргизы: 'Кыргызы',
    киргизы: 'кыргызы',
    Киргизскую: 'Кыргызскую',
    Кирги́зской: 'Кыргызской',
  };

  /**
   * Создаем динамический RegExp для нахождения матчей текста в DOM дереве.
   * С помощью цикла перебираем все пары из объекта замен replacements
   * и на каждое слово для замены генерируем Regex для его нахождения в тексте.
   */
  function createRegexp(dictionary = {}) {
    let regExpEmptyStr = '';
    for (const i in dictionary) {
      regExpEmptyStr += `((?<=\\s|^|[0-9.?:!,;-«'"(])${i}(?=\\s|$|[0-9.?:!,;-»'")]))|`;
    }
    const regExpStr = regExpEmptyStr.slice(0, -1);

    /**
     * Итоговый склеянный Regex, созданный динамически из всех слов для замены.
     * */
    const mainRegExp = new RegExp(`${regExpStr}`, 'gmui');
    return mainRegExp;
  }

  function createTooltipContent() {
    const el = document.createElement('div');
    el.classList.add('kg-replacer__tooltipContent');
    el.innerHTML = `
      Мы любим нашу страну. Мы за правильное написание нашей страны в русскоязычном мире.
      <br/>
      <br/>
      <span style='color:red'>Мы не Киргизия. Мы - Кыргызстан</span>.
      <br/>
      (Статья 1 в Конституции Кыргызской Республики)
      <br />
      <br />
      Поддержи петицию за правильное написание Кыргызстана: 
    `;
    return el;
  }

  function getAllTextNodes(rootNode = document.body) {
    const treeWalker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.nodeType === Node.TEXT_NODE
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const nodeList = [];
    let currentNode = treeWalker.currentNode;

    while (currentNode) {
      /**
       * отфильтровываем снова патамучта туда попадает body
       * хотя можно было начать со второго
       * но у меня параноя
       */
      if (
        currentNode.nodeType === Node.TEXT_NODE &&
        !currentNode.parentNode.classList.contains(
          'kg-replacer__tooltipContent'
        )
      ) {
        nodeList.push(currentNode);
      }
      currentNode = treeWalker.nextNode();
    }
    return nodeList;
  }

  // Создаем инф-ю карточку
  const tooltipContent = createTooltipContent();

  function handleTooltipHover(event) {
    const target = event.target;
    const boundingClientRect = target.getBoundingClientRect();
    const x = boundingClientRect.left;
    const y = boundingClientRect.top + boundingClientRect.height + 10;
    tooltipContent.style.top = `${y}px`;
    tooltipContent.style.left = `${x}px`;
    tooltipContent.style.visibility = `visible`;
  }

  function handleTooltipUnHover() {
    tooltipContent.style.visibility = `hidden`;
  }

  function createTooltip(match) {
    const trimmedMatch = match.trim();
    const el = document.createElement('span');
    el.classList.add('kg-replacer__tooltip');
    el.innerHTML = `
      <del class="kg-replacer__tooltip__del">${match}</del> ${replacements[trimmedMatch]}
    `;
    //TODO Add Event Listener to show tooltip
    el.addEventListener('mouseenter', handleTooltipHover);
    el.addEventListener('mouseleave', handleTooltipUnHover);
    return el;
  }

  function replaceAndCreateNewNode(text = '', regex) {
    const el = document.createElement('span');

    const matches = text.match(regex) || [];
    const splittedContent = text.split(new RegExp(matches.join('|'), 'g'));

    for (let i = 0; i < splittedContent.length; i++) {
      // Проверяем не пустое ли значение
      if (splittedContent[i]) {
        const textNode = document.createTextNode(splittedContent[i]);
        el.appendChild(textNode);
      }
      // Проверяем не пустое ли значение
      if (matches[i]) {
        const tooltipEl = createTooltip(matches[i]);
        el.appendChild(tooltipEl);
      }
    }

    return el;
  }

  /**
   * Основная функция которая осуществляет поиск всех текстовых нодов
   * и вызывает фукнции для их замены.
   *
   * Set timeout стоит для того
   * чтобы страницы некоторые успевали загрузить весь html.
   */
  function main() {
    console.log('-------------updated----------');
    // вставляем в сайт

    // создаем Regex
    const regex = createRegexp(replacements);
    // находим все текстовые ноды
    const nodes = getAllTextNodes();
    // отфильтровываем по совпадению
    const filteredNodes = nodes.filter((node) => regex.test(node.data));

    // перебираем и заменяем на новую ноду
    filteredNodes.forEach((node) => {
      const parentElement = node.parentElement;

      // Если это уже созданный тултип то пропускаем
      const isPreviusTooltip = parentElement.classList.contains('kg-replacer__tooltip__del');
      if (isPreviusTooltip) return;

      // новая нода
      const newNode = replaceAndCreateNewNode(node.data, regex);
      // заменяем
      parentElement.replaceChild(newNode, node);
    });

    document.body.appendChild(tooltipContent);
  }
  // main();
  //Запускаем main через 2.5s
  setTimeout(main, 3500);

  let timeoutId;
  window.addEventListener('scroll', function () {
    // clear the timeout if it's already set
    clearTimeout(timeoutId);

    // set a new timeout to run the code after 5 seconds
    timeoutId = setTimeout(function () {
      main();
      // code to run only once, every time the user has scrolled the page, but not more often than every 5 seconds
    }, 5000);
  });
});
