import { Icon } from '../components/index.jsx'

// Quem se cadastrou e ainda não foi liberado pelo engenheiro não vê dado nenhum.
export default function Aguardando({ usuario, onSair }) {
  return (
    <div className="login">
      <div className="login-box">
        <div className="brand"><i />MinhaObra</div>
        <div className="card vazio">
          <div className="vazio-ico"><Icon name="cadeado" size={36} /></div>
          <h2>Conta aguardando liberação</h2>
          <p>Olá, {usuario.nome}. O engenheiro responsável precisa liberar seu acesso e dizer em quais obras você trabalha. Assim que ele liberar, é só entrar de novo.</p>
          <button className="btn linha" onClick={onSair}>Sair</button>
        </div>
      </div>
    </div>
  )
}
