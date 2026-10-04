import { obterExcecaoMagia } from "../../data/magiasExcecoesSubclasse";
import { Fragment, useState } from "react";
import { criarMagiaVazia } from "../../utils/magia";
import { formatarModificador } from "../../utils/dnd";
import { MAGIAS } from "../../data/magiasSistema";
import { CLASSES } from "../../data/classes";
import { TALENTOS } from "../../data/talentos";
import { obterAtributoConjuracao } from "../../utils/conjuracao";
import ModalCatalogoMagias from "../modal/ModalCatalogoMagias";
import DetalheMagia from "../modal/DetalheMagia";
import "./BlocoMagias.css";
import Icon from "../icons/Icon";

const NIVEIS_MAGIA = [
  { valor: 0, label: "Truque" },
  { valor: 1, label: "1º nível" },
  { valor: 2, label: "2º nível" },
  { valor: 3, label: "3º nível" },
  { valor: 4, label: "4º nível" },
  { valor: 5, label: "5º nível" },
  { valor: 6, label: "6º nível" },
  { valor: 7, label: "7º nível" },
  { valor: 8, label: "8º nível" },
  { valor: 9, label: "9º nível" },
];

const CLASSES_INICIADO_MAGIA = [
  "bardo", "bruxo", "clerigo", "druida", "feiticeiro", "mago",
];

export default function BlocoMagias({
  ficha,
  modificadoresAtributos,
  bonusProficiencia,
  espacosMagia,
  onChangeEspacoMagia,
  espacosMagiaPacto,
  onChangeEspacoPacto,
  magias,
  onChangeMagias,
  concentracaoAtual,      // NOVO
  onIniciarConcentracao,  // NOVO
  onPararConcentracao,    // NOVO
  onAplicarEfeitoPv,
  onAplicarCondicao,
}) {
  const conjuracoes = [
    {
      classeId: ficha.classeId,
      nivel: ficha.nivel,
      subclasseId: ficha.subclasseId,
    },
    ...(ficha.classesSecundarias ?? []),
  ]
    .map(({ classeId, nivel, subclasseId }) => {
      const atributo = obterAtributoConjuracao(classeId, subclasseId, nivel);
      const modificador = modificadoresAtributos?.[atributo];
      if (!atributo || !Number.isFinite(modificador)) return null;

      return {
        classeId,
        nome: CLASSES.find((item) => item.id === classeId)?.nome ?? classeId,
        atributo,
        modificador,
        cd: 8 + bonusProficiencia + modificador,
        ataque: bonusProficiencia + modificador,
      };
    })
    .filter(Boolean);

  const [modalAberto, setModalAberto] = useState(false);
  const [expandidas, setExpandidas] = useState(() => new Set());

  function encontrarMagiaCatalogo(nome) {
    const termo = nome.trim().toLowerCase();
    if (!termo) return null;
    return MAGIAS.find((magia) => magia.nome.toLowerCase() === termo) ?? null;
  }

  function alternarExpandida(id) {
    setExpandidas((atual) => {
      const proxima = new Set(atual);
      if (proxima.has(id)) {
        proxima.delete(id);
      } else {
        proxima.add(id);
      }
      return proxima;
    });
  }

  function handleAdicionarDoCatalogo(magiaCatalogo, classeId, origemEspecial = null) {
    onChangeMagias([
      ...magias,
      {
        id: crypto.randomUUID(),
        nome: magiaCatalogo.nome,
        nivel: magiaCatalogo.nivel,
        preparada:
          obterExcecaoMagia(ficha, magiaCatalogo.id, classeId)?.tipo ===
          "sempre-preparada",
        origemId: magiaCatalogo.id,
        classeId,
        ...(origemEspecial ? { origemEspecial, fonteEspecial: "Segredos Mágicos" } : {}),
      },
    ]);
  }

  function handleAdicionarMagia() {
    onChangeMagias([...magias, criarMagiaVazia()]);
  }

  function handleRemoverMagia(id) {
    onChangeMagias(magias.filter((magia) => magia.id !== id));
  }

  function handleAlterarMagia(id, campo, valor) {
    onChangeMagias(
      magias.map((magia) =>
        magia.id === id ? {
          ...magia,
          [campo]: valor,
          ...(campo === "nome" ? { origemId: null } : {}),
          ...(campo === "classeId" && valor !== "especial"
            ? { origemEspecial: null, fonteEspecial: "" }
            : {}),
          ...(["nome", "nivel", "classeId"].includes(campo)
            ? { origemSubclasseId: null }
            : {}),
        } : magia
      )
    );
  }

  function handleAlterarOrigemEspecial(id, origemEspecial, fonteEspecial = "") {
    onChangeMagias(
      magias.map((magia) =>
        magia.id === id ? { ...magia, origemEspecial, fonteEspecial } : magia
      )
    );
  }

  function handleChangeEspaco(nivel, campo, evento) {
    const novoValor = Math.max(0, Number(evento.target.value) || 0);
    onChangeEspacoMagia(nivel, campo, novoValor);
  }

  return (
    <>
      <section>
        <h3 className="bloco-titulo">Conjuração</h3>
        {conjuracoes.length === 0 ? (
          <p className="magias-aviso">
            Nenhuma classe da ficha possui conjuração no nível atual.
          </p>
        ) : (
          <div className="magias-resumo-grupos">
            {conjuracoes.map(({ classeId, nome, atributo, cd, ataque }) => (
              <div key={classeId} className="magias-resumo-grupo">
                <h4 className="magias-resumo-classe">{nome}</h4>
                <div className="magias-resumo">
                  <div className="magias-resumo-item">
                    <span className="magias-resumo-label">Atributo de conjuração</span>
                    <span className="magias-resumo-valor">
                      {atributo.charAt(0).toUpperCase() + atributo.slice(1)}
                    </span>
                  </div>
                  <div className="magias-resumo-item">
                    <span className="magias-resumo-label">CD de magia</span>
                    <span className="magias-resumo-valor">{cd}</span>
                  </div>
                  <div className="magias-resumo-item">
                    <span className="magias-resumo-label">Bônus de ataque</span>
                    <span className="magias-resumo-valor">
                      {formatarModificador(ataque)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="bloco-titulo">Espaços de magia</h3>
        <div className="espacos-magia-grid">
          {Object.entries(espacosMagia).map(([nivel, espaco]) => (
            <div key={nivel} className="espaco-magia-campo">
              <span className="espaco-magia-nivel">{nivel}º</span>
              <input
                type="number"
                min="0"
                className="espaco-magia-input"
                value={espaco.usados}
                onChange={(evento) => handleChangeEspaco(nivel, "usados", evento)}
                aria-label={`Espaços usados de nível ${nivel}`}
              />
              <span className="espaco-magia-separador">/</span>
              <input
                type="number"
                min="0"
                className="espaco-magia-input"
                value={espaco.total}
                onChange={(evento) => handleChangeEspaco(nivel, "total", evento)}
                aria-label={`Espaços totais de nível ${nivel}`}
              />
            </div>
          ))}
                </div>
      </section>

      {espacosMagiaPacto && (
        <section>
          <h3 className="bloco-titulo">Espaços de Magia de Pacto (Bruxo)</h3>
          <div className="espacos-magia-grid">
            <div className="espaco-magia-campo">
              <span className="espaco-magia-nivel">{espacosMagiaPacto.nivel}º</span>
              <input
                type="number"
                min="0"
                max={espacosMagiaPacto.quantidade}
                className="espaco-magia-input"
                value={espacosMagiaPacto.usados}
                onChange={(evento) =>
                  onChangeEspacoPacto(Math.max(0, Number(evento.target.value) || 0))
                }
                aria-label="Espaços de pacto usados"
              />
              <span className="espaco-magia-separador">/</span>
              <span className="espaco-magia-input">{espacosMagiaPacto.quantidade}</span>
            </div>
          </div>
          <p className="levelup-texto">Recupera no descanso curto ou longo.</p>
        </section>
      )}

      <section>
        <h3 className="bloco-titulo">Magias conhecidas</h3>

        <button
          type="button"
          className="magias-abrir-catalogo"
          onClick={() => setModalAberto(true)}
        >
          Adicionar Magias
        </button>

        <ModalCatalogoMagias
          aberto={modalAberto}
          onFechar={() => setModalAberto(false)}
          onAdicionarMagia={handleAdicionarDoCatalogo}
          ficha={ficha}
          modificadoresConjuracao={Object.fromEntries(
            conjuracoes.map((conjuracao) => [conjuracao.classeId, conjuracao.modificador])
          )}
          onAplicarEfeitoPv={onAplicarEfeitoPv}
          onAplicarCondicao={onAplicarCondicao}
        />

        {magias.length === 0 ? (
          <p className="magias-vazio">Nenhuma magia cadastrada ainda.</p>
        ) : (
          <table className="magias-tabela">
            <thead>
              <tr>
                <th aria-label="Expandir"></th>
                <th>Magia</th>
                <th>Nível</th>
                <th>Origem</th>
                <th>Preparada</th>
                <th>Concentração</th>
                <th aria-label="Remover"></th>
              </tr>
            </thead>
            <tbody>
              {magias.map((magia) => {
                const dadosCatalogo = encontrarMagiaCatalogo(magia.nome);
                const semprePreparada =
                  dadosCatalogo &&
                  obterExcecaoMagia(ficha, dadosCatalogo.id, magia.classeId)?.tipo ===
                    "sempre-preparada";
                const aberta = expandidas.has(magia.id);

                return (
                  <Fragment key={magia.id}>
                    <tr>
                      <td className="magias-coluna-expandir">
                        <button
                          type="button"
                          className="magias-expandir"
                          onClick={() => alternarExpandida(magia.id)}
                          aria-expanded={aberta}
                          aria-label={
                            `${aberta ? "Recolher" : "Expandir"} detalhes de ${magia.nome || "magia sem nome"}`
                          }
                        >
                          <span
                            className={
                              aberta ? "magias-seta is-aberta" : "magias-seta"
                            }
                          >
                            <Icon name="chevron" className="ui-icon--chevron" />
                          </span>
                        </button>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={magia.nome}
                          placeholder="Nome da magia"
                          aria-label="Nome da magia"
                          disabled={Boolean(magia.origemSubclasseAutomatica)}
                          onChange={(evento) =>
                            handleAlterarMagia(magia.id, "nome", evento.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={magia.nivel}
                          aria-label={`Nível de ${magia.nome || "magia"}`}
                          disabled={Boolean(magia.origemSubclasseAutomatica)}
                          onChange={(evento) =>
                            handleAlterarMagia(
                              magia.id,
                              "nivel",
                              Number(evento.target.value)
                            )
                          }
                        >
                          {NIVEIS_MAGIA.map((nivel) => (
                            <option key={nivel.valor} value={nivel.valor}>
                              {nivel.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={magia.classeId ?? ""}
                          disabled={Boolean(magia.origemSubclasseAutomatica)}
                          onChange={(evento) => handleAlterarMagia(magia.id, "classeId", evento.target.value)}
                          aria-label={`Origem de ${magia.nome || "magia"}`}
                        >
                          <option value="">Não definida</option>
                          {[{ classeId: ficha.classeId }, ...(ficha.classesSecundarias ?? [])]
                            .filter(({ classeId }) => classeId)
                            .map(({ classeId }) => (
                              <option key={classeId} value={classeId}>
                                {CLASSES.find((item) => item.id === classeId)?.nome ?? classeId}
                              </option>
                            ))}
                          <option value="especial">Talento, item ou regra especial</option>
                        </select>
                        {magia.origemSubclasseAutomatica && (
                          <small className="magias-origem-subclasse">
                            {magia.origemSubclasseTipo === "sempre-preparada"
                              ? "Sempre preparada pela subclasse"
                              : "Concedida pela subclasse"}
                          </small>
                        )}
                      </td>
                      <td className="magias-coluna-preparada">
                        <input
                          type="checkbox"
                          checked={Boolean(magia.preparada || semprePreparada)}
                          disabled={Boolean(semprePreparada || magia.origemSubclasseAutomatica)}
                          title={
                            semprePreparada
                              ? "Sempre preparada pela subclasse"
                              : magia.origemSubclasseAutomatica
                              ? "Magia concedida pela subclasse"
                              : undefined
                          }
                          onChange={(evento) =>
                            handleAlterarMagia(
                              magia.id,
                              "preparada",
                              evento.target.checked
                            )
                          }
                          aria-label={`${magia.nome || "Magia"} preparada`}
                        />
                      </td>

                      <td className="magias-coluna-concentracao">
  {dadosCatalogo?.concentracao ? (
    concentracaoAtual?.magiaId === magia.id ? (
      <button
        type="button"
        className="magias-concentracao-botao is-ativa"
        onClick={onPararConcentracao}
      >
        <Icon name="target" /> Concentrando
      </button>
    ) : (
      <button
        type="button"
        className="magias-concentracao-botao"
        onClick={() => onIniciarConcentracao(magia)}
        title={
          concentracaoAtual
            ? `Substitui a concentração em ${concentracaoAtual.nome}`
            : undefined
        }
      >
        <Icon name="target" /> Concentrar
      </button>
    )
  ) : (
    <span className="magias-concentracao-vazio">—</span>
  )}
</td>


                      <td>
                        <button
                          type="button"
                          className="magias-remover"
                          onClick={() => handleRemoverMagia(magia.id)}
                          disabled={Boolean(magia.origemSubclasseAutomatica)}
                          title={magia.origemSubclasseAutomatica ? "Remova ou altere a subclasse para retirar esta magia" : undefined}
                          aria-label={`Remover ${magia.nome || "magia"}`}
                        >
                          <Icon name="remove" />
                        </button>
                      </td>
                    </tr>
                    {magia.classeId === "especial" && (
                      <tr>
                        <td colSpan={7} className="magias-linha-detalhe">
                          <label>
                            Origem desta magia
                            <select value={magia.origemEspecial?.tipo ?? "manual"} onChange={(evento) => {
                              const tipo = evento.target.value;
                              handleAlterarOrigemEspecial(
                                magia.id,
                                tipo === "segredos-magicos"
                                  ? { tipo, classeId: "bardo", fonteId: "segredos-magicos" }
                                  : { tipo },
                                tipo === "segredos-magicos" ? "Segredos Mágicos" : ""
                              );
                            }}>
                              <option value="manual">Conteúdo manual</option>
                              <option value="regra-da-mesa">Regra da mesa</option>
                              <option value="segredos-magicos">Segredos Mágicos</option>
                              <option value="talento">Talento</option>
                              <option value="item">Item</option>
                            </select>
                          </label>
                          {(!magia.origemEspecial?.tipo || ["manual", "regra-da-mesa"].includes(magia.origemEspecial.tipo)) && (
                            <label>
                              Descrição da origem
                              <input
                                type="text"
                                value={magia.fonteEspecial ?? ""}
                                placeholder="Ex.: recompensa concedida pelo mestre"
                                onChange={(evento) => handleAlterarMagia(magia.id, "fonteEspecial", evento.target.value)}
                              />
                            </label>
                          )}
                          {magia.origemEspecial?.tipo === "talento" && (
                            <>
                              <label>
                                Talento presente na ficha
                                <select
                                  value={magia.origemEspecial.fonteId ?? ""}
                                  onChange={(evento) => {
                                    const fonteId = evento.target.value;
                                    const talento = TALENTOS.find((item) => item.id === fonteId);
                                    handleAlterarOrigemEspecial(
                                      magia.id,
                                      {
                                        tipo: "talento",
                                        fonteId,
                                        ...(fonteId === "iniciado-magia"
                                          ? { classeLista: magia.origemEspecial?.classeLista ?? "" }
                                          : {}),
                                      },
                                      talento?.nome ?? ""
                                    );
                                  }}
                                >
                                  <option value="">Selecione...</option>
                                  {magia.origemEspecial.fonteId && !(ficha.habilidades ?? []).some((habilidade) => habilidade.tipo === "talento" && habilidade.origemId === magia.origemEspecial.fonteId) && (
                                    <option value={magia.origemEspecial.fonteId}>Fonte ausente: {magia.origemEspecial.fonteId}</option>
                                  )}
                                  {[...new Set((ficha.habilidades ?? []).filter((habilidade) => habilidade.tipo === "talento" && habilidade.origemId).map((habilidade) => habilidade.origemId))].map((idTalento) => (
                                    <option key={idTalento} value={idTalento}>{TALENTOS.find((item) => item.id === idTalento)?.nome ?? idTalento}</option>
                                  ))}
                                </select>
                              </label>
                              {magia.origemEspecial.fonteId === "iniciado-magia" && (
                                <label>
                                  Lista escolhida no talento
                                  <select
                                    value={magia.origemEspecial.classeLista ?? ""}
                                    onChange={(evento) => handleAlterarOrigemEspecial(
                                      magia.id,
                                      { ...magia.origemEspecial, classeLista: evento.target.value },
                                      "Iniciado em Magia"
                                    )}
                                  >
                                    <option value="">Selecione...</option>
                                    {CLASSES_INICIADO_MAGIA.map((classeId) => (
                                      <option key={classeId} value={classeId}>{CLASSES.find((item) => item.id === classeId)?.nome ?? classeId}</option>
                                    ))}
                                  </select>
                                </label>
                              )}
                            </>
                          )}
                          {magia.origemEspecial?.tipo === "item" && (
                            <label>
                              Item presente no inventário
                              <select
                                value={magia.origemEspecial.fonteId ?? ""}
                                onChange={(evento) => {
                                  const fonteId = evento.target.value;
                                  const item = (ficha.inventario ?? []).find((registro) => registro.id === fonteId);
                                  handleAlterarOrigemEspecial(
                                    magia.id,
                                    { tipo: "item", fonteId },
                                    item?.nome ?? ""
                                  );
                                }}
                              >
                                <option value="">Selecione...</option>
                                {magia.origemEspecial.fonteId && !(ficha.inventario ?? []).some((item) => item.id === magia.origemEspecial.fonteId) && (
                                  <option value={magia.origemEspecial.fonteId}>Fonte ausente: {magia.origemEspecial.fonteId}</option>
                                )}
                                {(ficha.inventario ?? []).map((item) => (
                                  <option key={item.id} value={item.id}>{item.nome || "Item sem nome"}</option>
                                ))}
                              </select>
                            </label>
                          )}
                        </td>
                      </tr>
                    )}
                    {aberta && (
                      <tr>
                        <td colSpan={7} className="magias-linha-detalhe">
                          {dadosCatalogo ? (
                            <DetalheMagia
                              magia={dadosCatalogo}
                              modificadorConjuracao={
                                conjuracoes.find((conjuracao) =>
                                  conjuracao.classeId === (
                                    magia.classeId === "especial"
                                      ? magia.origemEspecial?.classeId
                                      : magia.classeId
                                  )
                                )?.modificador ?? 0
                              }
                              onAplicarEfeitoPv={onAplicarEfeitoPv}
                              onAplicarCondicao={onAplicarCondicao}
                            />
                          ) : (
                            <p className="magias-sem-catalogo">
                              Essa é uma magia personalizada — sem dados de
                              resistência, dano ou condição cadastrados.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        <button
          type="button"
          className="magias-adicionar"
          onClick={handleAdicionarMagia}
        >
          + Magia personalizada
        </button>
      </section>
    </>
  );
}
