import { retratoLocalValido } from "../../utils/retrato";
import { obterAntecedente } from "../../data/antecedentes";
import { obterClasse } from "../../data/classes";
import { PERICIAS } from "../../data/pericias";
import { obterRaca } from "../../data/racas";
import { obterSubclasse } from "../../data/subclasses";
import { calcularBonusAcerto, formatarDano } from "../../utils/ataque";
import { calcularCapacidadeCarga, calcularPesoInventario } from "../../utils/carga";
import { ATRIBUTOS, formatarModificador } from "../../utils/dnd";
import "./FichaImpressao.css";

const ROTULOS_MOEDAS = {
  cobre: "PC",
  prata: "PP",
  electro: "PE",
  ouro: "PO",
  platina: "PL",
};

const ROTULOS_DESCANSO = {
  curto: "descanso curto",
  longo: "descanso longo",
  amanhecer: "amanhecer",
  manual: "evento/manual",
};

function textoLista(valores) {
  return valores?.length ? valores.map((valor) => valor.replaceAll("-", " ")).join(", ") : "—";
}

function LinhaVazia({ colunas, texto = "Nenhum registro." }) {
  return (
    <tr>
      <td colSpan={colunas} className="ficha-impressao-vazio">{texto}</td>
    </tr>
  );
}

function Secao({ titulo, children, className = "" }) {
  return (
    <section className={`ficha-impressao-secao ${className}`.trim()}>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

export default function FichaImpressao({
  ficha,
  atributosTotais,
  modificadoresAtributos,
  bonusProficiencia,
  nivelTotal,
  percepcaoPassiva,
  investigacaoPassiva,
}) {
  const raca = obterRaca(ficha.racaId, ficha.subracaId);
  const antecedente = obterAntecedente(ficha.antecedenteId);
  const classes = [
    { classeId: ficha.classeId, subclasseId: ficha.subclasseId, nivel: ficha.nivel },
    ...(ficha.classesSecundarias ?? []),
  ].filter(({ classeId }) => classeId);
  const salvaguardasProficientes = new Set(
    ficha.salvaguardasProficientes ?? obterClasse(ficha.classeId)?.salvaguardasProficientes ?? []
  );
  const pesoTotal = calcularPesoInventario(ficha.inventario ?? []);
  const capacidadeCarga = calcularCapacidadeCarga(atributosTotais.forca);
  const espacos = Object.entries(ficha.espacosMagia ?? {}).filter(([, espaco]) => espaco.total > 0);

  return (
    <article className="ficha-impressao">
      <header className="ficha-impressao-cabecalho">
        {retratoLocalValido(ficha.retrato) && <img className="ficha-impressao-retrato" src={ficha.retrato} alt={`Retrato de ${ficha.nome || "personagem"}`} width="72" height="72" />}
        <div>
          <p className="ficha-impressao-marca">D&amp;D Fichas</p>
          <h1>{ficha.nome || "Personagem sem nome"}</h1>
          <p>{ficha.jogador ? `Jogador: ${ficha.jogador}` : "Jogador não informado"}</p>
        </div>
        <div className="ficha-impressao-nivel">
          <strong>{nivelTotal}</strong>
          <span>Nível total</span>
        </div>
      </header>

      <section className="ficha-impressao-identidade">
        <div><span>Raça</span><strong>{raca?.nome ?? "—"}</strong></div>
        <div><span>Antecedente</span><strong>{antecedente?.nome ?? "—"}</strong></div>
        <div className="ficha-impressao-identidade-classes">
          <span>Classes</span>
          <strong>
            {classes.length
              ? classes.map(({ classeId, subclasseId, nivel }) => {
                  const classe = obterClasse(classeId);
                  const subclasse = obterSubclasse(subclasseId);
                  return `${classe?.nome ?? classeId} ${nivel}${subclasse ? ` — ${subclasse.nome}` : ""}`;
                }).join(" • ")
              : "—"}
          </strong>
        </div>
      </section>

      <div className="ficha-impressao-grade ficha-impressao-grade--atributos">
        {ATRIBUTOS.map((atributo) => (
          <div key={atributo.chave} className="ficha-impressao-atributo">
            <span>{atributo.label}</span>
            <strong>{atributosTotais[atributo.chave]}</strong>
            <b>{formatarModificador(modificadoresAtributos[atributo.chave])}</b>
          </div>
        ))}
      </div>

      <div className="ficha-impressao-grade ficha-impressao-grade--resumo">
        <div><span>PV</span><strong>{ficha.status.pvAtual}/{ficha.status.pvMax}</strong></div>
        <div><span>PV temporários</span><strong>{ficha.status.pvTemp ?? 0}</strong></div>
        <div><span>CA</span><strong>{ficha.status.ca}</strong></div>
        <div><span>Iniciativa</span><strong>{formatarModificador(modificadoresAtributos.destreza + (ficha.status.iniciativa ?? 0))}</strong></div>
        <div><span>Deslocamento</span><strong>{ficha.status.deslocamento ?? raca?.deslocamento ?? 9} m</strong></div>
        <div><span>Proficiência</span><strong>{formatarModificador(bonusProficiencia)}</strong></div>
        <div><span>Percepção passiva</span><strong>{percepcaoPassiva}</strong></div>
        <div><span>Investigação passiva</span><strong>{investigacaoPassiva}</strong></div>
      </div>

      <div className="ficha-impressao-duas-colunas">
        <Secao titulo="Salvaguardas">
          <ul className="ficha-impressao-lista-compacta">
            {ATRIBUTOS.map((atributo) => {
              const proficiente = salvaguardasProficientes.has(atributo.chave);
              const valor = modificadoresAtributos[atributo.chave] + (proficiente ? bonusProficiencia : 0);
              return <li key={atributo.chave}><span>{proficiente ? "●" : "○"} {atributo.label}</span><strong>{formatarModificador(valor)}</strong></li>;
            })}
          </ul>
        </Secao>

        <Secao titulo="Perícias">
          <ul className="ficha-impressao-lista-compacta ficha-impressao-lista-compacta--dupla">
            {PERICIAS.map((pericia) => {
              const proficiente = Boolean(ficha.pericias?.[pericia.chave]);
              const valor = modificadoresAtributos[pericia.atributo] + (proficiente ? bonusProficiencia : 0);
              return <li key={pericia.chave}><span>{proficiente ? "●" : "○"} {pericia.label}</span><strong>{formatarModificador(valor)}</strong></li>;
            })}
          </ul>
        </Secao>
      </div>

      <Secao titulo="Ataques">
        <table>
          <thead><tr><th>Nome</th><th>Acerto</th><th>Dano</th></tr></thead>
          <tbody>
            {(ficha.ataques ?? []).length === 0 && <LinhaVazia colunas={3} />}
            {(ficha.ataques ?? []).map((ataque) => (
              <tr key={ataque.id}>
                <td>{ataque.nome || "Ataque sem nome"}</td>
                <td>{formatarModificador(calcularBonusAcerto(ataque, modificadoresAtributos, bonusProficiencia))}</td>
                <td>{formatarDano(ataque, modificadoresAtributos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Secao>

      <Secao titulo="Recursos e estado atual">
        <div className="ficha-impressao-recursos">
          {(ficha.recursos ?? []).length === 0 && <p className="ficha-impressao-vazio">Nenhum recurso rastreável.</p>}
          {(ficha.recursos ?? []).map((recurso) => (
            <div key={recurso.id}>
              <strong>{recurso.nome || "Recurso sem nome"}</strong>
              <span>{Math.max(0, recurso.usosMax - recurso.usosGastos)}/{recurso.usosMax} disponíveis • restaura em {ROTULOS_DESCANSO[recurso.restauraEm] ?? recurso.restauraEm}</span>
            </div>
          ))}
        </div>
        <p><strong>Concentração:</strong> {ficha.concentracao?.nome ?? "nenhuma"}</p>
        <p><strong>Condições:</strong> {(ficha.condicoesAtivas ?? []).length ? ficha.condicoesAtivas.map((condicao) => condicao.nome).join(", ") : "nenhuma"}</p>
      </Secao>

      <Secao titulo="Proficiências">
        <div className="ficha-impressao-proficiencias">
          <p><strong>Idiomas:</strong> {textoLista(ficha.idiomas)}</p>
          <p><strong>Armas:</strong> {textoLista(ficha.proficienciasArmas)}</p>
          <p><strong>Armaduras:</strong> {textoLista(ficha.proficienciasArmaduras)}{ficha.proficienciasEscudos ? ", escudos" : ""}</p>
          <p><strong>Ferramentas:</strong> {textoLista(ficha.proficienciasFerramentas)}</p>
        </div>
      </Secao>

      <Secao titulo="Habilidades e talentos">
        <div className="ficha-impressao-cartoes">
          {(ficha.habilidades ?? []).length === 0 && <p className="ficha-impressao-vazio">Nenhuma habilidade cadastrada.</p>}
          {(ficha.habilidades ?? []).map((habilidade) => (
            <div key={habilidade.id}>
              <strong>{habilidade.nome || "Habilidade sem nome"}</strong>
              <span>{habilidade.tipo}{habilidade.nivel ? ` • nível ${habilidade.nivel}` : ""}</span>
              {habilidade.descricao && <p>{habilidade.descricao}</p>}
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Magias">
        <p className="ficha-impressao-linha-resumo">
          <strong>Espaços:</strong>{" "}
          {espacos.length ? espacos.map(([nivel, espaco]) => `${nivel}º ${espaco.total - espaco.usados}/${espaco.total}`).join(" • ") : "nenhum"}
          {ficha.espacosMagiaPacto ? ` • Pacto ${ficha.espacosMagiaPacto.nivel}º ${ficha.espacosMagiaPacto.quantidade - ficha.espacosMagiaPacto.usados}/${ficha.espacosMagiaPacto.quantidade}` : ""}
        </p>
        <table>
          <thead><tr><th>Magia</th><th>Círculo</th><th>Origem</th><th>Preparada</th></tr></thead>
          <tbody>
            {(ficha.magias ?? []).length === 0 && <LinhaVazia colunas={4} />}
            {[...(ficha.magias ?? [])].sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome)).map((magia) => (
              <tr key={magia.id}>
                <td>{magia.nome || "Magia sem nome"}</td>
                <td>{magia.nivel === 0 ? "Truque" : `${magia.nivel}º`}</td>
                <td>{obterClasse(magia.classeId)?.nome ?? magia.fonteEspecial ?? magia.classeId ?? "—"}</td>
                <td>{magia.preparada || magia.origemSubclasseAutomatica ? "Sim" : "Não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Secao>

      <Secao titulo="Inventário">
        <p className="ficha-impressao-linha-resumo"><strong>Carga:</strong> {pesoTotal} / {capacidadeCarga} kg</p>
        <table>
          <thead><tr><th>Item</th><th>Qtd.</th><th>Peso</th><th>Estado</th></tr></thead>
          <tbody>
            {(ficha.inventario ?? []).length === 0 && <LinhaVazia colunas={4} />}
            {(ficha.inventario ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.nome || "Item sem nome"}</td>
                <td>{item.quantidade}</td>
                <td>{item.peso} kg</td>
                <td>{[item.equipado && "equipado", item.magico && "mágico", item.sintonizado && "sintonizado"].filter(Boolean).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ficha-impressao-linha-resumo"><strong>Moedas:</strong> {Object.entries(ROTULOS_MOEDAS).map(([chave, rotulo]) => `${rotulo} ${ficha.moedas?.[chave] ?? 0}`).join(" • ")}</p>
      </Secao>

      <Secao titulo="Personagem e anotações" className="ficha-impressao-notas">
        <p><strong>Aparência:</strong> {ficha.aparencia || "—"}</p>
        <p><strong>Personalidade:</strong> {ficha.personalidade || "—"}</p>
        <p><strong>Histórico:</strong> {ficha.historico || "—"}</p>
        <p><strong>Objetivo:</strong> {ficha.objetivo || "—"}</p>
        <p><strong>Anotações:</strong> {ficha.notas || "—"}</p>
      </Secao>

      <footer className="ficha-impressao-rodape">Ficha gerada pelo D&amp;D Fichas</footer>
    </article>
  );
}
