import { useState } from "react";
import { RACAS, obterSubraca, obterSubracasPorRaca } from "../../data/racas";
import { CLASSES, obterClasse } from "../../data/classes";
import {
  obterSubclassesPorClasse,
  obterNivelEscolhaSubclasse,
} from "../../data/subclasses";
import { ANTECEDENTES, obterAntecedente } from "../../data/antecedentes";
import { ATRIBUTOS } from "../../utils/dnd";
import { PERICIAS } from "../../data/pericias";
import { IDIOMAS } from "../../data/idiomas";
import { FERRAMENTAS } from "../../data/equipamentos";
import {
  opcoesFerramentas,
  opcoesPericias,
  quantidadeSubstituicoesFerramentas,
} from "../../utils/proficienciasCriacao";
import {
  PRE_REQUISITOS_MULTICLASSE,
  atendePreRequisitoMulticlasse,
  periciasDisponiveisMulticlasse,
} from "../../data/proficienciasMulticlasse";
import { obterRegraMulticlasse } from "../../data/proficienciasMulticlasse";
import "./BlocoRacaClasse.css";
import Icon from "../icons/Icon";
import { obterEscolhasPorClasse } from "../../data/escolhasClasses";
import {
  classesDaFichaParaEscolhas,
  escolhaAtiva,
  opcoesDaEscolha,
  quantidadeDaEscolha,
  valoresDaEscolha,
} from "../../utils/escolhasClasses";
import {
  escolhasAtivasSubclasses,
  opcoesDaEscolhaSubclasse,
  valoresDaEscolhaSubclasse,
} from "../../utils/escolhasSubclasses";

function CampoNivel({ nivel, nivelMaximo, onChangeNivel }) {
  const [nivelRascunho, setNivelRascunho] = useState(String(nivel));

  function confirmarNivel() {
    const numero = Math.min(
      nivelMaximo,
      Math.max(1, Number(nivelRascunho) || 1)
    );
    setNivelRascunho(String(numero));
    if (numero !== nivel) onChangeNivel(numero);
  }

  function handleKeyDown(evento) {
    if (evento.key === "Enter") evento.currentTarget.blur();
  }

  return (
    <input
      type="number"
      min="1"
      max={nivelMaximo}
      value={nivelRascunho}
      onChange={(evento) => setNivelRascunho(evento.target.value)}
      onBlur={confirmarNivel}
      onKeyDown={handleKeyDown}
    />
  );
}

export default function BlocoRacaClasse({
  racaId,
  subracaId,
  escolhasRaciais = {},
  classeId,
  antecedenteId,
  nivel,
  nivelTotal,
  nivelMaximoPrincipal,
  subclasseId,
  classesSecundarias,
  atributosTotais = {},
  pericias = {},
  proficienciasMulticlasse = {},
  bonusRacialEscolhido,
  onChangeRaca,
  onChangeSubraca,
  onChangeEscolhaRacial,
  onChangeClasse,
  onChangeAntecedente,
  onChangeNivel,
  onChangeSubclasse,
  onAdicionarClasseSecundaria,
  onAlterarClasseSecundaria,
  onRemoverClasseSecundaria,
  onEscolherPericiaMulticlasse,
  onChangeBonusRacialEscolhido,
  escolhasCriacao = {},
  onChangeEscolhasCriacao,
  ficha,
  onChangeEscolhaClasse,
  onChangeEscolhaSubclasse,
}) {
  const racaSelecionada = RACAS.find((r) => r.id === racaId);
  const subracasDisponiveis = obterSubracasPorRaca(racaId);
  const subracaSelecionada = obterSubraca(subracaId);
  const subclassesDisponiveis = obterSubclassesPorClasse(classeId);
  const nivelEscolhaSubclasse = obterNivelEscolhaSubclasse(classeId);
  const podeEscolherSubclasse = nivel >= (nivelEscolhaSubclasse ?? Infinity);
  const classe = obterClasse(classeId);
  const antecedente = obterAntecedente(antecedenteId);
  const labelAtributoPrincipal = classe
    ? ATRIBUTOS.find((a) => a.chave === classe.atributoPrincipal)?.label
    : null;

  return (
    <section>
      <h3 className="bloco-titulo">Raça e classe</h3>
      <div className="raca-classe-grid">
                <label className="raca-classe-campo">
          <span className="raca-classe-label">Raça</span>
          <select
            value={racaId ?? ""}
            onChange={(evento) => onChangeRaca(evento.target.value || null)}
          >
            <option value="">Selecione...</option>
            {RACAS.map((raca) => (
              <option key={raca.id} value={raca.id}>
                {raca.nome}
              </option>
            ))}
          </select>
        </label>

        {subracasDisponiveis.length > 0 && (
          <label className="raca-classe-campo">
            <span className="raca-classe-label">Sub-raça</span>
            <select
              value={subracaId ?? ""}
              onChange={(evento) => onChangeSubraca(evento.target.value || null)}
            >
              <option value="">Selecione...</option>
              {subracasDisponiveis.map((subraca) => (
                <option key={subraca.id} value={subraca.id}>{subraca.nome}</option>
              ))}
            </select>
          </label>
        )}

        {racaSelecionada?.ancestralidadesDraconicas?.length > 0 && (
          <label className="raca-classe-campo">
            <span className="raca-classe-label">Ancestralidade dracônica</span>
            <select
              value={escolhasRaciais.ancestralidadeDraconicaId ?? ""}
              onChange={(evento) => onChangeEscolhaRacial("ancestralidadeDraconicaId", evento.target.value)}
            >
              <option value="">Selecione...</option>
              {racaSelecionada.ancestralidadesDraconicas.map((item) => (
                <option key={item.id} value={item.id}>{item.nome} — {item.dano}, {item.forma}</option>
              ))}
            </select>
          </label>
        )}

        {racaSelecionada?.atributosEscolhaLivre && (
          <div className="raca-classe-campo raca-classe-campo--largo">
            <span className="raca-classe-label">
              Escolha {racaSelecionada.atributosEscolhaLivre} atributos pra +1 cada
            </span>
            <div className="raca-escolha-livre-selects">
              {Array.from({ length: racaSelecionada.atributosEscolhaLivre }).map(
                (_, indice) => {
                  const outrosEscolhidos = (bonusRacialEscolhido ?? []).filter(
                    (_, i) => i !== indice
                  );
                  return (
                    <select
                      key={indice}
                      aria-label={`Atributo para bônus racial, escolha ${indice + 1} de ${racaSelecionada.atributosEscolhaLivre}`}
                      value={bonusRacialEscolhido?.[indice] ?? ""}
                      onChange={(evento) =>
                        onChangeBonusRacialEscolhido(indice, evento.target.value)
                      }
                    >
                      <option value="">Selecione...</option>
                      {ATRIBUTOS.filter(
                        (a) =>
                          !racaSelecionada.bonusAtributos?.[a.chave] &&
                          !outrosEscolhidos.includes(a.chave)
                      ).map((a) => (
                        <option key={a.chave} value={a.chave}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  );
                }
              )}
            </div>
          </div>
        )}

            

                <label className="raca-classe-campo">
          <span className="raca-classe-label">Classe</span>
          <select
            value={classeId ?? ""}
            onChange={(evento) => onChangeClasse(evento.target.value || null)}
          >
            <option value="">Selecione...</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        {classeId && (
          <label className="raca-classe-campo">
            <span className="raca-classe-label">Subclasse</span>
            <select
              value={subclasseId ?? ""}
              onChange={(evento) => onChangeSubclasse(evento.target.value || null)}
              disabled={!podeEscolherSubclasse}
            >
              <option value="">
                {podeEscolherSubclasse
                  ? "Selecione..."
                  : `Disponível no nível ${nivelEscolhaSubclasse}`}
              </option>
              {subclassesDisponiveis.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="raca-classe-campo">
          <span className="raca-classe-label">Nível</span>
          <CampoNivel
            key={nivel}
            nivel={nivel}
            nivelMaximo={nivelMaximoPrincipal}
            onChangeNivel={onChangeNivel}
          />
        </label>


        <label className="raca-classe-campo raca-classe-campo--largo">
          <span className="raca-classe-label">Antecedente</span>
          <select
            value={antecedenteId ?? ""}
            onChange={(evento) =>
              onChangeAntecedente(evento.target.value || null)
            }
          >
            <option value="">Selecione...</option>
            {ANTECEDENTES.map((antecedente) => (
              <option key={antecedente.id} value={antecedente.id}>
                {antecedente.nome}
              </option>
            ))}
          </select>
        </label>
        
            </div>

      {classeId && (
        <div className="multiclasse-bloco">
          <span className="raca-classe-label">Classes secundárias (multiclasse)</span>
          <p className="multiclasse-limite">Nível total: {nivelTotal}/20</p>
          {(classesSecundarias ?? []).map((c, indice) => {
            const regra = obterRegraMulticlasse(c.classeId) ?? {};
            const requisito = PRE_REQUISITOS_MULTICLASSE[c.classeId];
            const registro = proficienciasMulticlasse[c.classeId];
            const quantidadePericias = regra.escolhas
              ?.filter((escolha) => escolha.tipo === "pericia")
              .reduce((total, escolha) => total + escolha.quantidade, 0) ?? 0;
            const periciasEscolhidas = registro?.pericias ?? [];
            const podeEscolherPericia = periciasEscolhidas.length < quantidadePericias;
            return <div key={indice} className="multiclasse-linha">
              <select
                value={c.classeId ?? ""}
                aria-label={`Classe secundária ${indice + 1}`}
                onChange={(evento) =>
                  onAlterarClasseSecundaria(indice, "classeId", evento.target.value)
                }
              >
                <option value="">Selecione...</option>
                {CLASSES.filter((classeItem) =>
                  classeItem.id !== classeId &&
                  !(classesSecundarias ?? []).some(
                    (outra, outroIndice) => outroIndice !== indice && outra.classeId === classeItem.id
                  )
                ).map(
                  (classeItem) => (
                    <option
                      key={classeItem.id}
                      value={classeItem.id}
                      disabled={!atendePreRequisitoMulticlasse(classeItem.id, atributosTotais)}
                    >
                      {classeItem.nome}
                    </option>
                  )
                )}
              </select>
              <input
                type="number"
                min="1"
                max={Math.max(1, 20 - (nivelTotal - (Number(c.nivel) || 1)))}
                className="multiclasse-nivel"
                value={c.nivel}
                aria-label={`Nível da classe secundária ${CLASSES.find((classeItem) => classeItem.id === c.classeId)?.nome ?? indice + 1}`}
                onChange={(evento) =>
                  onAlterarClasseSecundaria(
                    indice,
                    "nivel",
                    Math.max(1, Number(evento.target.value) || 1)
                  )
                }
              />
              <select
                value={c.subclasseId ?? ""}
                disabled={
                  !c.classeId ||
                  Number(c.nivel) < (obterNivelEscolhaSubclasse(c.classeId) ?? Infinity)
                }
                onChange={(evento) =>
                  onAlterarClasseSecundaria(
                    indice,
                    "subclasseId",
                    evento.target.value || null
                  )
                }
                aria-label={`Subclasse de ${
                  CLASSES.find((classeItem) => classeItem.id === c.classeId)?.nome ?? "classe secundária"
                }`}
              >
                <option value="">
                  {!c.classeId
                    ? "Escolha a classe"
                    : Number(c.nivel) < (obterNivelEscolhaSubclasse(c.classeId) ?? Infinity)
                    ? `Disponível no nível ${obterNivelEscolhaSubclasse(c.classeId)}`
                    : "Selecione a subclasse"}
                </option>
                {obterSubclassesPorClasse(c.classeId).map((subclasse) => (
                  <option key={subclasse.id} value={subclasse.id}>
                    {subclasse.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="multiclasse-remover"
                onClick={() => onRemoverClasseSecundaria(indice)}
                aria-label={`Remover classe secundária ${CLASSES.find((classeItem) => classeItem.id === c.classeId)?.nome ?? indice + 1}`}
              >
                <Icon name="remove" />
              </button>
              {c.classeId && (
                <div className="multiclasse-detalhes">
                  <p>
                    Pré-requisito: {requisito?.descricao ?? "—"} {atendePreRequisitoMulticlasse(c.classeId, atributosTotais) ? "✓" : "✕"}
                    {" · Dado de vida: "}d{obterClasse(c.classeId)?.dadoVida}
                  </p>
                  <p>
                    Recebe: {[...(regra.armas ?? []), ...(regra.armaduras ?? []), regra.escudos ? "escudos" : null, ...(regra.ferramentas ?? [])]
                      .filter(Boolean).join(", ") || "nenhuma proficiência automática"}.
                  </p>
                  {quantidadePericias > 0 && (
                    <label>
                      {podeEscolherPericia
                        ? `Escolha ${quantidadePericias - periciasEscolhidas.length} perícia da multiclasse`
                        : "Perícia de multiclasse escolhida"}
                      {podeEscolherPericia && (
                        <select
                          value=""
                          onChange={(evento) => {
                            if (evento.target.value) onEscolherPericiaMulticlasse(indice, evento.target.value);
                          }}
                        >
                          <option value="">Selecione...</option>
                          {periciasDisponiveisMulticlasse(pericias).map((pericia) => (
                            <option key={pericia.chave} value={pericia.chave}>{pericia.nome}</option>
                          ))}
                        </select>
                      )}
                      {periciasEscolhidas.length > 0 && <span> {periciasEscolhidas.join(", ")}</span>}
                    </label>
                  )}
                </div>
              )}
            </div>
          })}
          <button
            type="button"
            className="multiclasse-adicionar"
            onClick={onAdicionarClasseSecundaria}
            disabled={nivelTotal >= 20}
            aria-describedby={nivelTotal >= 20 ? "multiclasse-limite" : undefined}
            title={nivelTotal >= 20 ? "O personagem já atingiu o nível máximo (20)" : undefined}
          >
            + Adicionar classe
          </button>
          {nivelTotal >= 20 && (
            <p id="multiclasse-limite" className="raca-classe-info" role="status">
              Não é possível adicionar outra classe: o personagem já atingiu o nível máximo (20).
            </p>
          )}
        </div>
      )}

      {classe && (
        <p className="raca-classe-info">
          Dado de vida: d{classe.dadoVida} — Atributo principal: {labelAtributoPrincipal}
        </p>
      )}
      {racaSelecionada && (
        <p className="raca-classe-info">
          Traços raciais: {[...(racaSelecionada.tracos ?? []), ...(subracaSelecionada?.tracos ?? [])].map((traco) => traco.nome).join(", ") || "sem traços adicionais"}.
        </p>
      )}
      {antecedente && (
        <p className="raca-classe-info">
          {antecedente.caracteristica.nome}: {antecedente.caracteristica.descricao}
        </p>
      )}
      <EscolhasCriacao classe={classe} raca={racaSelecionada} subraca={subracaSelecionada} antecedente={antecedente} escolhas={escolhasCriacao} onChange={onChangeEscolhasCriacao} />
      <EscolhasClasse ficha={ficha} onChange={onChangeEscolhaClasse} />
      <EscolhasSubclasse ficha={ficha} onChange={onChangeEscolhaSubclasse} />
      
    </section>
  );
}

function EscolhasSubclasse({ ficha, onChange }) {
  if (!ficha || !onChange) return null;
  const escolhas = escolhasAtivasSubclasses(ficha);
  if (!escolhas.length) return null;

  return <div className="multiclasse-bloco">
    <span className="raca-classe-label">Escolhas de subclasse</span>
    <div className="raca-classe-grid">
      {escolhas.map(({ classe, escolha }) => {
        const quantidade = quantidadeDaEscolha(escolha, classe.nivel);
        const valores = valoresDaEscolhaSubclasse(ficha, classe.subclasseId, escolha.id);
        const opcoes = opcoesDaEscolhaSubclasse(escolha, ficha, classe);
        return <div key={`${classe.subclasseId}:${escolha.id}`} className="raca-classe-campo raca-classe-campo--largo">
          <span className="raca-classe-label">{escolha.nome} ({classe.subclasseId}) — escolha {quantidade}</span>
          <div className="raca-escolha-livre-selects">
            {Array.from({ length: quantidade }, (_, indice) => escolha.tipo === "texto" ? (
              <input key={indice} type="text" value={valores[indice] ?? ""} aria-label={`${escolha.nome}, escolha ${indice + 1} de ${quantidade}`} onChange={(evento) => { const proximos = [...valores]; proximos[indice] = evento.target.value; onChange(classe.subclasseId, escolha.id, proximos); }} />
            ) : (
              <select key={indice} value={valores[indice] ?? ""} aria-label={`${escolha.nome}, escolha ${indice + 1} de ${quantidade}`} onChange={(evento) => { const proximos = [...valores]; proximos[indice] = evento.target.value || null; onChange(classe.subclasseId, escolha.id, proximos); }}>
                <option value="">Selecione...</option>
                {valores[indice] && !opcoes.some((opcao) => opcao.id === valores[indice]) && <option value={valores[indice]}>Indisponível: {valores[indice]}</option>}
                {opcoes.filter((opcao) => !valores.includes(opcao.id) || valores[indice] === opcao.id).map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
              </select>
            ))}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

function EscolhasClasse({ ficha, onChange }) {
  if (!ficha || !onChange) return null;
  const classes = classesDaFichaParaEscolhas(ficha);
  const grupos = classes.map((classe) => ({
    classe,
    escolhas: obterEscolhasPorClasse(classe.classeId, classe.nivel)
      .filter((escolha) => escolhaAtiva(escolha, ficha, classe.classeId)),
  })).filter((grupo) => grupo.escolhas.length);
  if (!grupos.length) return null;

  return <div className="multiclasse-bloco">
    <span className="raca-classe-label">Escolhas de classe</span>
    {grupos.map(({ classe: classeAtual, escolhas }) => (
      <div key={classeAtual.classeId} className="raca-classe-grid">
        {escolhas.map((escolha) => {
          const quantidade = quantidadeDaEscolha(escolha, classeAtual.nivel);
          const valores = valoresDaEscolha(ficha, classeAtual.classeId, escolha.id);
          const opcoes = opcoesDaEscolha(escolha, ficha, classeAtual);
          return <div key={escolha.id} className="raca-classe-campo raca-classe-campo--largo">
            <span className="raca-classe-label">
              {escolha.nome} ({classeAtual.classeId}) — {escolha.opcional ? "opcional" : `escolha ${quantidade}`}
            </span>
            <div className="raca-escolha-livre-selects">
              {Array.from({ length: quantidade }, (_, indice) => escolha.tipo === "texto" ? (
                <input
                  key={indice}
                  type="text"
                  value={valores[indice] ?? ""}
                  aria-label={`${escolha.nome}, escolha ${indice + 1} de ${quantidade}`}
                  onChange={(evento) => {
                    const proximos = [...valores];
                    proximos[indice] = evento.target.value;
                    onChange(classeAtual.classeId, escolha.id, proximos);
                  }}
                />
              ) : (
                <select
                  key={indice}
                  value={valores[indice] ?? ""}
                  aria-label={`${escolha.nome}, escolha ${indice + 1} de ${quantidade}`}
                  onChange={(evento) => {
                    const proximos = [...valores];
                    proximos[indice] = evento.target.value || null;
                    onChange(classeAtual.classeId, escolha.id, proximos);
                  }}
                >
                  <option value="">Selecione...</option>
                  {valores[indice] && !opcoes.some((opcao) => opcao.id === valores[indice]) && (
                    <option value={valores[indice]}>Indisponível: {valores[indice]}</option>
                  )}
                  {opcoes.filter((opcao) => !valores.includes(opcao.id) || valores[indice] === opcao.id).map((opcao) => (
                    <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>;
        })}
      </div>
    ))}
  </div>;
}

function EscolhasCriacao({ classe, raca, subraca, antecedente, escolhas, onChange }) {
  if (!onChange) return null;
  const nomesPericias = Object.fromEntries(PERICIAS.map((item) => [item.chave, item.label]));
  const nomesIdiomas = Object.fromEntries(IDIOMAS.map((item) => [item.id, item.nome]));
  const nomesFerramentas = Object.fromEntries(FERRAMENTAS.map((item) => [item.id, item.nome]));
  const idiomasEscolhiveis = IDIOMAS.filter((item) => item.tipo !== "secreto").map((item) => item.id);
  const classePericias = classe?.proficienciasIniciais?.pericias;
  const ferramentasFixas = [
    ...(classe?.proficienciasIniciais?.ferramentas ?? []),
    ...(raca?.ferramentasFixas ?? []),
    ...(subraca?.ferramentasFixas ?? []),
    ...(antecedente?.ferramentasFixas ?? []),
  ];
  const substituicoes = quantidadeSubstituicoesFerramentas(classe, raca, antecedente, subraca);
  return <div className="raca-classe-grid">
    <CampoEscolhaCriacao titulo="Perícias da classe" chave="periciasClasse" quantidade={classePericias?.quantidade} opcoes={opcoesPericias(classePericias)} nomes={nomesPericias} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Ferramentas da classe" chave="ferramentasClasse" quantidade={classe?.proficienciasIniciais?.ferramentasEscolha?.quantidade} opcoes={opcoesFerramentas(classe?.proficienciasIniciais?.ferramentasEscolha)} bloqueadas={[...ferramentasFixas, ...(escolhas.ferramentasRaca ?? []), ...(escolhas.ferramentasAntecedente ?? [])]} nomes={nomesFerramentas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Perícias da raça" chave="periciasRaca" quantidade={raca?.periciasEscolha?.quantidade} opcoes={opcoesPericias(raca?.periciasEscolha)} nomes={nomesPericias} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Idiomas da raça" chave="idiomasRaca" quantidade={raca?.idiomasEscolha} opcoes={idiomasEscolhiveis.filter((id) => !raca?.idiomasFixos?.includes(id))} nomes={nomesIdiomas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Ferramentas da raça" chave="ferramentasRaca" quantidade={raca?.ferramentasEscolha?.quantidade} opcoes={opcoesFerramentas(raca?.ferramentasEscolha)} bloqueadas={[...ferramentasFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasAntecedente ?? [])]} nomes={nomesFerramentas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Idiomas da sub-raça" chave="idiomasSubraca" quantidade={subraca?.idiomasEscolha} opcoes={idiomasEscolhiveis} nomes={nomesIdiomas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Ferramentas da sub-raça" chave="ferramentasSubraca" quantidade={subraca?.ferramentasEscolha?.quantidade} opcoes={opcoesFerramentas(subraca?.ferramentasEscolha)} bloqueadas={[...ferramentasFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasRaca ?? []), ...(escolhas.ferramentasAntecedente ?? [])]} nomes={nomesFerramentas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Idiomas do antecedente" chave="idiomasAntecedente" quantidade={antecedente?.idiomasEscolha} opcoes={idiomasEscolhiveis} nomes={nomesIdiomas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Ferramentas do antecedente" chave="ferramentasAntecedente" quantidade={antecedente?.ferramentasEscolha?.quantidade} opcoes={opcoesFerramentas(antecedente?.ferramentasEscolha)} bloqueadas={[...ferramentasFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasRaca ?? [])]} nomes={nomesFerramentas} escolhas={escolhas} onChange={onChange} />
    <CampoEscolhaCriacao titulo="Substituições por proficiências repetidas" chave="ferramentasSubstitutas" quantidade={substituicoes} opcoes={FERRAMENTAS.map((item) => item.id)} bloqueadas={[...new Set([...ferramentasFixas, ...(escolhas.ferramentasClasse ?? []), ...(escolhas.ferramentasRaca ?? []), ...(escolhas.ferramentasAntecedente ?? [])])]} nomes={nomesFerramentas} escolhas={escolhas} onChange={onChange} />
  </div>;
}

function CampoEscolhaCriacao({ titulo, chave, quantidade, opcoes, bloqueadas = [], nomes, escolhas, onChange }) {
  if (!quantidade) return null;
  const valores = escolhas[chave] ?? [];
  const faltam = Math.max(0, quantidade - new Set(valores.filter(Boolean)).size);

  return <div className="raca-classe-campo raca-classe-campo--largo">
    <span className="raca-classe-label">{titulo}: faltam {faltam}</span>
    <div className="raca-escolha-livre-selects">
      {Array.from({ length: quantidade }, (_, indice) => <select
        key={indice}
        value={valores[indice] ?? ""}
        aria-label={`${titulo}, escolha ${indice + 1} de ${quantidade}`}
        onChange={(evento) => {
          const proximos = [...valores];
          proximos[indice] = evento.target.value || null;
          onChange(chave, proximos);
        }}
      >
        <option value="">Selecione...</option>
        {opcoes.filter((id) => !bloqueadas.includes(id) && (!valores.includes(id) || valores[indice] === id)).map((id) => <option key={id} value={id}>{nomes[id] ?? id}</option>)}
      </select>)}
    </div>
  </div>;
}
