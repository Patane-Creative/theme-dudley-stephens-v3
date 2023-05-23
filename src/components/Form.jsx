import { useState, useEffect } from "preact/hooks";
import { handleize } from "../utils";

const Form = ({ data }) => {
  console.log(data);

  const [parentProductVariantId, setParentProductVariantId] = useState(
    data.parent_product_initial_variant.id
  );
  const [monogramUuid, setMonogramUuid] = useState(crypto.randomUUID());
  const [monogramFor, setMonogramFor] = useState(
    `${data.parent_product.title} - ${data.parent_product_initial_variant.title}`
  );
  const [style, setStyle] = useState(
    data.monogram_product_initial_variant.title
  );
  const [monogram, setMonogram] = useState("Dudley");
  const [firstInitial, setFirstInitial] = useState("A");
  const [middleInitial, setMiddleInitial] = useState("B");
  const [lastInitial, setLastInitial] = useState("C");

  const textOverlay = document.querySelector(
    "monogram-customizer .text-overlay"
  );

  document.addEventListener("ajaxProduct:added", () => {
    setMonogramUuid(crypto.randomUUID());
  });

  document.addEventListener("variant:change", (e) => {
    setParentProductVariantId(e.detail.variant.id);
    setMonogramFor(e.detail.variant.name);
  });

  useEffect(() => {
    if (textOverlay) {
      textOverlay.classList.remove("classic", "block", "monogram");
      textOverlay.classList.add(handleize(style));

      // need to use spans for ability to style individual letters
      textOverlay.innerHTML =
        handleize(style) === "block"
          ? monogram
          : `<span class="first">${firstInitial.toUpperCase()}</span><span class="middle">${middleInitial.toUpperCase()}</span><span class="last">${lastInitial.toUpperCase()}</span>`;
    }
  }, [style, monogram, firstInitial, middleInitial, lastInitial]);

  function location() {
    const handle = handleize(data.parent_product.type);

    if (handle === "kids") {
      return "Left Chest";
    } else if (handle === "accessories" || handle === "kids-accessories") {
      return "Opposite pineapple (left side)";
    } else {
      return "Left Sleeve";
    }
  }

  function setMonogramLineItemProperty() {
    if (handleize(style) === "classic") {
      return (
        firstInitial.toUpperCase() +
        middleInitial.toUpperCase() +
        lastInitial.toUpperCase()
      );
    }

    if (handleize(style) === "block") {
      return monogram;
    }

    if (handleize(style) === "monogram") {
      return (
        firstInitial.toUpperCase() +
        lastInitial.toUpperCase() +
        middleInitial.toUpperCase()
      );
    }
  }

  function MonogramButtons() {
    // only show block option for kids products
    const visibleMonogramVariants = data.monogram_product.variants.filter(
      (variant) =>
        handleize(variant.title).includes("block") &&
        handleize(data.parent_product.type) !== "kids"
          ? false
          : true
    );

    return visibleMonogramVariants.map((variant) => (
      <>
        <label
          for={variant.id}
          className={style === variant.title ? "active" : ""}
        >
          <img
            src={variant.featured_image.src}
            alt={variant.featured_image.title}
          />
          <p>{variant.title}</p>
        </label>
        <input
          type="radio"
          name="items[0][id]"
          id={variant.id}
          value={variant.id}
          onChange={() => setStyle(variant.title)}
          checked={style === variant.title}
          data-title={variant.title}
          style="display:none;"
        />
      </>
    ));
  }

  function MonogramInputs() {
    if (handleize(style) === "block") {
      return (
        <input
          type="text"
          maxLength="10"
          onInput={(e) => setMonogram(e.target.value)}
          value={monogram}
        />
      );
    }

    return (
      <>
        <input
          type="text"
          maxLength="1"
          onInput={(e) => setFirstInitial(e.target.value)}
          value={firstInitial}
        />
        <input
          type="text"
          maxLength="1"
          onChange={(e) => setMiddleInitial(e.target.value)}
          value={middleInitial}
        />
        <input
          type="text"
          maxLength="1"
          onChange={(e) => setLastInitial(e.target.value)}
          value={lastInitial}
        />
      </>
    );
  }

  return (
    <form action="/cart/add" method="POST">
      <MonogramButtons />
      <MonogramInputs />

      {/* Monogram product */}
      <input type="hidden" name="items[0][quantity]" value="1" />
      <input
        type="hidden"
        name="items[0][properties][_Monogram ID]"
        value={monogramUuid}
      />
      <input
        type="hidden"
        name="items[0][properties][Monogram for]"
        value={monogramFor}
      />
      <input type="hidden" name="items[0][properties][Style]" value={style} />
      <input
        type="hidden"
        name="items[0][properties][_Location]"
        value={location()}
      />
      <input type="hidden" name="items[0][properties][_Gift wrap]" value="No" />
      <input
        type="hidden"
        name="items[0][properties][Monogram]"
        value={setMonogramLineItemProperty()}
      />

      {/* Parent product */}
      <input type="hidden" name="items[1][id]" value={parentProductVariantId} />
      <input type="hidden" name="items[1][quantity]" value="1" />
      <input
        type="hidden"
        name="items[1][properties][_Monogram ID]"
        value={monogramUuid}
      />
      <input type="hidden" name="items[1][properties][Style]" value={style} />
      <input
        type="hidden"
        name="items[1][properties][_Location]"
        value={location()}
      />
      <input
        type="hidden"
        name="items[1][properties][Monogram]"
        value={setMonogramLineItemProperty()}
      />

      {monogram && firstInitial && middleInitial && lastInitial ? (
        <button class="btn monogram__add-to-cart">Submit</button>
      ) : (
        <button class="btn monogram__add-to-cart" type="button" disabled>
          ERROR
        </button>
      )}
    </form>
  );
};

export default Form;
