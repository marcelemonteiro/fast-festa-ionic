// CPF
<input id="cpf" name="cpf" uniquecpf="true" minlength="14" validarobrigatoriedadecpf="true" 
data-msg-minlength="CPF inválido." placeholder="Ex: 000.000.000-00" class="form-control cpf error" 
type="text" value="" maxlength="14" autocomplete="off" aria-invalid="true">

<label id="cpf-error" class="error" for="cpf">Informe um CPF válido.</label>

//Cep
<input id="cep" name="cep" data-numero="numero" data-bairro="bairro" data-uf-label="cidadeUsuarioUF" minlength="9" 
data-logradouro="logradouro" data-msg-minlength="CEP inválido." data-uf-id="estadoUsuarioId" placeholder="CEP" 
class="form-control cep valid" data-cidade-id="cidadeUsuarioId" data-cidade-label="cidadeUsuarioNome" required="true" type="text" value="" 
maxlength="9" autocomplete="off" aria-required="true" aria-invalid="false">