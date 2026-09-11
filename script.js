    // ESTADO DA APLICAÇÃO (localStorage)
    let employees = JSON.parse(localStorage.getItem('app_employees')) || [
      { id: '1', name: 'Carlos Oliveira', role: 'Auxiliar de Escritório', salary: 3000, workStart: '09:00', workEnd: '17:30', admission: '2025-03-10' },
      { id: '2', name: 'Ana Souza', role: 'Assistente Administrativo', salary: 3500, workStart: '09:00', workEnd: '17:30', admission: '2025-10-01' }
    ];

    let punches = JSON.parse(localStorage.getItem('app_punches')) || {};
    let vacations = JSON.parse(localStorage.getItem('app_vacations')) || [];

    // INICIALIZAÇÃO
    document.addEventListener('DOMContentLoaded', () => {
      updateClock();
      setInterval(updateClock, 1000);
      const todayKey = getTodayKey();
      document.getElementById('today-date').innerText = formatDate(todayKey);
      document.getElementById('input-date-edit').value = todayKey;
      
      renderEmployeeOptions();
      renderEmployeeList();
      renderBancoHoras();
      renderFerias();
      renderDecimoTerceiro();
      renderFolha();
    });

    function saveData() {
      localStorage.setItem('app_employees', JSON.stringify(employees));
      localStorage.setItem('app_punches', JSON.stringify(punches));
      localStorage.setItem('app_vacations', JSON.stringify(vacations));
    }

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').innerText = now.toLocaleTimeString('pt-BR');
    }

    function getTodayKey() {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }

    function formatMoney(value) {
      return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function switchTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      
      document.getElementById(`tab-${tabName}`).classList.add('active');
      event.target.classList.add('active');

      if (tabName === 'ajustes') renderEditTable();
      if (tabName === 'banco') renderBancoHoras();
      if (tabName === 'ferias') renderFerias();
      if (tabName === 'decimo') renderDecimoTerceiro();
      if (tabName === 'folha') renderFolha();
    }

    // CADASTRO DE FUNCIONÁRIOS
    function saveEmployee(e) {
      e.preventDefault();
      const id = document.getElementById('emp-id').value;
      const name = document.getElementById('emp-name').value;
      const role = document.getElementById('emp-role').value;
      const salary = parseFloat(document.getElementById('emp-salary').value) || 0;
      const workStart = document.getElementById('emp-work-start').value;
      const workEnd = document.getElementById('emp-work-end').value;
      const admission = document.getElementById('emp-admission').value;

      if (id) {
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
          employees[index] = { id, name, role, salary, workStart, workEnd, admission };
          alert('Cadastro atualizado!');
        }
      } else {
        const newEmp = {
          id: Date.now().toString(),
          name,
          role,
          salary,
          workStart,
          workEnd,
          admission
        };
        employees.push(newEmp);
        alert('Funcionário cadastrado!');
      }

      saveData();
      resetForm();
      renderEmployeeOptions();
      renderEmployeeList();
      renderBancoHoras();
      renderFerias();
      renderDecimoTerceiro();
      renderFolha();
    }

    function editEmployee(id) {
      const emp = employees.find(e => e.id === id);
      if (!emp) return;

      document.getElementById('emp-id').value = emp.id;
      document.getElementById('emp-name').value = emp.name;
      document.getElementById('emp-role').value = emp.role;
      document.getElementById('emp-salary').value = emp.salary || '';
      document.getElementById('emp-work-start').value = emp.workStart || '09:00';
      document.getElementById('emp-work-end').value = emp.workEnd || '17:30';
      document.getElementById('emp-admission').value = emp.admission;

      document.getElementById('form-title').innerText = 'Editar Funcionário';
      document.getElementById('btn-submit').innerText = 'Salvar Alterações';
      document.getElementById('btn-cancel').style.display = 'inline-block';
    }

    function resetForm() {
      document.getElementById('emp-id').value = '';
      document.getElementById('form-employee').reset();
      document.getElementById('emp-work-start').value = '09:00';
      document.getElementById('emp-work-end').value = '17:30';
      document.getElementById('form-title').innerText = 'Cadastrar Novo Funcionário';
      document.getElementById('btn-submit').innerText = 'Cadastrar Funcionário';
      document.getElementById('btn-cancel').style.display = 'none';
    }

    function deleteEmployee(id) {
      if (confirm('Deseja realmente remover este funcionário?')) {
        employees = employees.filter(emp => emp.id !== id);
        delete punches[id];
        vacations = vacations.filter(v => v.empId !== id);
        saveData();
        resetForm();
        renderEmployeeOptions();
        renderEmployeeList();
        renderBancoHoras();
        renderFerias();
        renderDecimoTerceiro();
        renderFolha();
      }
    }

    function renderEmployeeOptions() {
      const selects = [
        document.getElementById('select-employee-ponto'),
        document.getElementById('select-employee-edit'),
        document.getElementById('select-vacation-emp')
      ];

      selects.forEach(select => {
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Selecione --</option>';
        employees.forEach(emp => {
          select.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.role})</option>`;
        });
        select.value = currentVal;
      });
    }

    function renderEmployeeList() {
      const tbody = document.getElementById('employee-list-table');
      tbody.innerHTML = '';
      
      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
        return;
      }

      employees.forEach(emp => {
        tbody.innerHTML += `
          <tr>
            <td><strong>${emp.name}</strong><br><small>${emp.role}</small></td>
            <td><strong>${formatMoney(emp.salary)}</strong></td>
            <td>${emp.workStart || '09:00'} às ${emp.workEnd || '17:30'}</td>
            <td>${formatDate(emp.admission)}</td>
            <td>
              <div class="btn-group">
                <button class="btn btn-warning" style="padding: 4px 8px; font-size: 0.8rem;" onclick="editEmployee('${emp.id}')">Editar</button>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteEmployee('${emp.id}')">Excluir</button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    // REGISTRO DE PONTO
    function renderTodayStatus() {
      const empId = document.getElementById('select-employee-ponto').value;
      const actionsDiv = document.getElementById('ponto-actions');
      
      if (!empId) {
        actionsDiv.style.display = 'none';
        return;
      }
      
      actionsDiv.style.display = 'block';
      const today = getTodayKey();
      const empPunches = (punches[empId] && punches[empId][today]) ? punches[empId][today] : {};

      const tbody = document.getElementById('today-punches-table');
      const workedMinutes = calculateDailyMinutes(empPunches);
      const hoursStr = formatMinutesToHHMM(workedMinutes);

      tbody.innerHTML = `
        <tr>
          <td>${empPunches.entrada || '--:--'}</td>
          <td>${empPunches.saida_almoco || '--:--'}</td>
          <td>${empPunches.retorno_almoco || '--:--'}</td>
          <td>${empPunches.saida || '--:--'}</td>
          <td><strong>${hoursStr}</strong></td>
        </tr>
      `;
    }

    function registerPunch(type) {
      const empId = document.getElementById('select-employee-ponto').value;
      if (!empId) return;

      const today = getTodayKey();
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (!punches[empId]) punches[empId] = {};
      if (!punches[empId][today]) punches[empId][today] = {};

      punches[empId][today][type] = nowTime;
      saveData();
      renderTodayStatus();
    }

    // AJUSTE MANUAL
    function renderEditTable() {
      const empId = document.getElementById('select-employee-edit').value;
      const dateKey = document.getElementById('input-date-edit').value;
      const editArea = document.getElementById('edit-area');

      if (!empId || !dateKey) {
        editArea.style.display = 'none';
        return;
      }

      editArea.style.display = 'block';
      const dayData = (punches[empId] && punches[empId][dateKey]) ? punches[empId][dateKey] : {};

      const tbody = document.getElementById('edit-punches-table');
      tbody.innerHTML = `
        <tr>
          <td><input type="time" id="edit-e" class="input-table" value="${dayData.entrada || ''}"></td>
          <td><input type="time" id="edit-sa" class="input-table" value="${dayData.saida_almoco || ''}"></td>
          <td><input type="time" id="edit-ra" class="input-table" value="${dayData.retorno_almoco || ''}"></td>
          <td><input type="time" id="edit-s" class="input-table" value="${dayData.saida || ''}"></td>
          <td><input type="text" id="edit-obs" class="input-obs" placeholder="Ex: Atestado / Declaração" value="${dayData.obs || ''}"></td>
          <td>
            <button class="btn" style="padding: 6px 10px; font-size: 0.8rem;" onclick="saveManualPunch('${empId}', '${dateKey}')">Salvar</button>
          </td>
        </tr>
      `;
    }

    function saveManualPunch(empId, dateKey) {
      const e = document.getElementById('edit-e').value;
      const sa = document.getElementById('edit-sa').value;
      const ra = document.getElementById('edit-ra').value;
      const s = document.getElementById('edit-s').value;
      const obs = document.getElementById('edit-obs').value;

      if (!punches[empId]) punches[empId] = {};
      punches[empId][dateKey] = { entrada: e, saida_almoco: sa, retorno_almoco: ra, saida: s, obs: obs };

      saveData();
      alert('Ponto ajustado com sucesso!');
      renderTodayStatus();
      renderBancoHoras();
    }

    // HORAS E CÁLCULOS
    function timeToMinutes(timeStr) {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    }

    function formatMinutesToHHMM(totalMinutes) {
      const isNegative = totalMinutes < 0;
      const absMinutes = Math.abs(totalMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;
      const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
      return isNegative ? `-${formatted}` : formatted;
    }

    function calculateDailyMinutes(p) {
      if (!p || !p.entrada || !p.saida) return 0;
      const e = timeToMinutes(p.entrada);
      const sa = timeToMinutes(p.saida_almoco);
      const ra = timeToMinutes(p.retorno_almoco);
      const s = timeToMinutes(p.saida);

      let total = s - e;
      if (sa && ra && ra > sa) total -= (ra - sa);
      return total > 0 ? total : 0;
    }

    function getTargetMinutesForEmployee(emp) {
      const start = timeToMinutes(emp.workStart || '09:00');
      const end = timeToMinutes(emp.workEnd || '17:30');
      let target = end - start;
      if (target > 360) target -= 30;
      return target > 0 ? target : 480;
    }

    function calculateEmployeeFinancialPunches(emp) {
      const empPunches = punches[emp.id] || {};
      let totalWorkedMinutes = 0;
      let totalTargetMinutes = 0;
      const dailyTarget = getTargetMinutesForEmployee(emp);

      Object.keys(empPunches).forEach(dateStr => {
        const dayPunch = empPunches[dateStr];
        const worked = calculateDailyMinutes(dayPunch);
        if (worked > 0) {
          totalWorkedMinutes += worked;
          totalTargetMinutes += dailyTarget;
        }
      });

      const balanceMinutes = totalWorkedMinutes - totalTargetMinutes;
      const hourlyRate = (emp.salary || 0) / 220;
      const overtimeRate = hourlyRate * 1.5;

      let extraAmount = 0;
      let discountAmount = 0;

      if (balanceMinutes > 0) {
        extraAmount = (balanceMinutes / 60) * overtimeRate;
      } else if (balanceMinutes < 0) {
        discountAmount = (Math.abs(balanceMinutes) / 60) * hourlyRate;
      }

      return {
        balanceMinutes,
        hourlyRate,
        extraAmount,
        discountAmount
      };
    }

    function renderBancoHoras() {
      const tbody = document.getElementById('banco-horas-table');
      tbody.innerHTML = '';

      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
        return;
      }

      employees.forEach(emp => {
        const fin = calculateEmployeeFinancialPunches(emp);
        const balanceStr = formatMinutesToHHMM(fin.balanceMinutes);

        let statusBadge = '<span class="badge badge-success">Em Dia</span>';
        if (fin.balanceMinutes < 0) {
          statusBadge = '<span class="badge badge-danger">Com Débito</span>';
        } else if (fin.balanceMinutes > 0) {
          statusBadge = '<span class="badge badge-success">Com Hora Extra</span>';
        }

        tbody.innerHTML += `
          <tr>
            <td><strong>${emp.name}</strong></td>
            <td>${formatMoney(fin.hourlyRate)}/h</td>
            <td class="${fin.balanceMinutes < 0 ? 'saldo-negativo' : 'saldo-positivo'}">${balanceStr}</td>
            <td style="color:var(--success);"><strong>+ ${formatMoney(fin.extraAmount)}</strong></td>
            <td style="color:var(--danger);"><strong>- ${formatMoney(fin.discountAmount)}</strong></td>
            <td>${statusBadge}</td>
          </tr>
        `;
      });
    }

    // FÉRIAS
    function saveVacation(e) {
      e.preventDefault();
      const empId = document.getElementById('select-vacation-emp').value;
      const startDateStr = document.getElementById('vacation-start').value;
      const days = parseInt(document.getElementById('vacation-days').value);

      if (!empId || !startDateStr || !days) return;

      const startDate = new Date(startDateStr + 'T00:00:00');
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days - 1);

      const endDateStr = endDate.toISOString().split('T')[0];

      const newVacation = {
        id: Date.now().toString(),
        empId,
        startDate: startDateStr,
        endDate: endDateStr,
        days
      };

      vacations.push(newVacation);
      saveData();
      document.getElementById('form-vacation').reset();
      renderFerias();
      alert('Férias registradas!');
    }

    function deleteVacation(id) {
      if (confirm('Deseja excluir este registro de férias?')) {
        vacations = vacations.filter(v => v.id !== id);
        saveData();
        renderFerias();
      }
    }

    function isEmployeeOnVacationToday(empId) {
      const today = new Date();
      today.setHours(0,0,0,0);

      return vacations.some(v => {
        if (v.empId !== empId) return false;
        const start = new Date(v.startDate + 'T00:00:00');
        const end = new Date(v.endDate + 'T00:00:00');
        return today >= start && today <= end;
      });
    }

    function renderFerias() {
      const tbody = document.getElementById('ferias-table');
      const historyBody = document.getElementById('ferias-history-table');
      
      tbody.innerHTML = '';
      historyBody.innerHTML = '';

      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
        return;
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      employees.forEach(emp => {
        const empVacations = vacations.filter(v => v.empId === emp.id);
        const countVacations = empVacations.length;
        const onVacationNow = isEmployeeOnVacationToday(emp.id);

        const admDate = new Date(emp.admission + 'T00:00:00');
        const diffDays = Math.floor(Math.abs(today - admDate) / (1000 * 60 * 60 * 24));
        const monthsWorked = Math.floor(diffDays / 30.4375);

        let statusCLT = '<span class="badge badge-success">Em Dia</span>';
        const expectedVacations = Math.floor(monthsWorked / 12);
        const pendingVacations = expectedVacations - countVacations;

        if (pendingVacations === 1) {
          statusCLT = '<span class="badge badge-warning">1 Férias Vencida</span>';
        } else if (pendingVacations >= 2) {
          statusCLT = '<span class="badge badge-danger">Férias Dobradas</span>';
        }

        let currentStatusBadge = '<span class="badge badge-success">Em Trabalho</span>';
        if (onVacationNow) {
          currentStatusBadge = '<span class="badge badge-info">EM FÉRIAS ATUALMENTE</span>';
        }

        tbody.innerHTML += `
          <tr>
            <td><strong>${emp.name}</strong><br><small style="color:var(--text-muted)">Admissão: ${formatDate(emp.admission)}</small></td>
            <td>${currentStatusBadge}</td>
            <td><strong>${countVacations}</strong> vez(es)</td>
            <td>${statusCLT}</td>
            <td>
              <button class="btn btn-warning" style="padding:4px 8px; font-size:0.8rem;" onclick="document.getElementById('select-vacation-emp').value='${emp.id}'">Programar</button>
            </td>
          </tr>
        `;
      });

      if (vacations.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum histórico de férias registrado.</td></tr>';
        return;
      }

      vacations.forEach(v => {
        const emp = employees.find(e => e.id === v.empId);
        const empSalary = emp ? emp.salary : 0;
        
        const baseVacationValue = (empSalary / 30) * v.days;
        const oneThirdValue = baseVacationValue / 3;
        const totalVacationGross = baseVacationValue + oneThirdValue;

        historyBody.innerHTML += `
          <tr>
            <td><strong>${emp ? emp.name : 'Removido'}</strong></td>
            <td>${formatDate(v.startDate)} até ${formatDate(v.endDate)}</td>
            <td>${v.days} dias</td>
            <td>${formatMoney(baseVacationValue)}</td>
            <td>${formatMoney(oneThirdValue)}</td>
            <td style="color:var(--success);"><strong>${formatMoney(totalVacationGross)}</strong></td>
            <td>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteVacation('${v.id}')">Excluir</button>
            </td>
          </tr>
        `;
      });
    }

    // 13º SALÁRIO
    function calculate13thMonths(admissionDateStr) {
      const currentYear = new Date().getFullYear();
      const admDate = new Date(admissionDateStr + 'T00:00:00');
      const admYear = admDate.getFullYear();

      if (admYear > currentYear) return 0;
      if (admYear < currentYear) return 12;

      let months = 12 - admDate.getMonth();
      if (admDate.getDate() > 15) {
        months -= 1;
      }
      return Math.max(0, Math.min(12, months));
    }

    function renderDecimoTerceiro() {
      const tbody = document.getElementById('decimo-terceiro-table');
      tbody.innerHTML = '';

      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
        return;
      }

      employees.forEach(emp => {
        const salary = emp.salary || 0;
        const avos = calculate13thMonths(emp.admission);
        const full13th = (salary / 12) * avos;
        const firstInstallment = full13th * 0.50;
        const secondInstallment = full13th * 0.50;

        tbody.innerHTML += `
          <tr>
            <td><strong>${emp.name}</strong><br><small>${emp.role}</small></td>
            <td>${formatDate(emp.admission)}</td>
            <td>${formatMoney(salary)}</td>
            <td><strong>${avos}/12</strong> avos</td>
            <td style="color:var(--primary);"><strong>${formatMoney(full13th)}</strong></td>
            <td style="color:var(--success);"><strong>${formatMoney(firstInstallment)}</strong></td>
            <td style="color:var(--info);"><strong>${formatMoney(secondInstallment)}</strong></td>
          </tr>
        `;
      });
    }

    // FOLHA DE PAGAMENTO
    function renderFolha() {
      const tbody = document.getElementById('folha-pagamento-table');
      tbody.innerHTML = '';

      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
        return;
      }

      employees.forEach(emp => {
        const salary = emp.salary || 0;
        const advanceDay20 = salary * 0.40;
        const baseFifthDay = salary * 0.60;

        const fin = calculateEmployeeFinancialPunches(emp);
        const netAdjustment = fin.extraAmount - fin.discountAmount;
        const finalFifthDay = baseFifthDay + netAdjustment;
        const totalMonth = advanceDay20 + finalFifthDay;

        let adjustText = 'R$ 0,00';
        if (netAdjustment > 0) {
          adjustText = `<span style="color:var(--success);">+ ${formatMoney(netAdjustment)} (H.Extra)</span>`;
        } else if (netAdjustment < 0) {
          adjustText = `<span style="color:var(--danger);">- ${formatMoney(Math.abs(netAdjustment))} (Desconto)</span>`;
        }

        tbody.innerHTML += `
          <tr>
            <td><strong>${emp.name}</strong></td>
            <td>${formatMoney(salary)}</td>
            <td><strong>${formatMoney(advanceDay20)}</strong></td>
            <td>${adjustText}</td>
            <td><strong>${formatMoney(finalFifthDay)}</strong></td>
            <td><strong style="color:var(--primary);">${formatMoney(totalMonth)}</strong></td>
          </tr>
        `;
      });
    }
